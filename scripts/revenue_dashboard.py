#!/usr/bin/env python3
"""Generate XDental revenue dashboard data.

Sources:
- Hotmart XDental API from legacy protected env
- Hotmart RX API from legacy protected env (for old Excellence Dental Academy recurrence)
- Stripe BR/LLC read-only keys from 1Password vault TAOS

No secrets are written to disk.
"""
import base64
import json
import os
import re
import subprocess
import sys
from collections import defaultdict
from datetime import datetime, date, time, timedelta, timezone
from pathlib import Path
from urllib.parse import urlencode

import requests

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "revenue-dashboard.json"
LEGACY_ENV = Path("/root/backup-openclaw-antigo/openclaw-config/.env")
BRT = timezone(timedelta(hours=-3))
NOW = datetime.now(BRT)
START_MONTH = NOW.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
START_YEAR = NOW.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
START_14D = (NOW - timedelta(days=13)).replace(hour=0, minute=0, second=0, microsecond=0)

LOW_TICKET_IDS = {5544688, 6255312, 5694790, 7407787, 7407769, 7407833}
EXCLUDED_PRODUCT_TERMS = ["la7 lace"]
RX_XDENTAL_ALLOWED_TERMS = ["excellence dental academy"]

META_BASE = "https://graph.facebook.com/v20.0"
META_SPEND_SPECS = [
    {"key": "low_tracao", "name": "Tracción de Caninos", "funnel": "Low Tickets", "account": "act_910603368132181", "token_env": "META_ACCESS_TOKEN_LT_TRACAO", "campaign_contains": ["tdr", "traccion", "tracción"]},
    {"key": "low_mesial", "name": "Mesialización de Molares", "funnel": "Low Tickets", "account": "act_1384080155548135", "token_env": "META_ACCESS_TOKEN_XDENTAL_NEW"},
    {"key": "low_comp", "name": "Explorando las Complicaciones", "funnel": "Low Tickets", "account": "act_945311137435028", "token_env": "META_ACCESS_TOKEN_XDENTAL_NEW"},
    {"key": "low_flujo", "name": "Flujo de Tratamiento", "funnel": "Low Tickets", "account": "act_971727392410108", "token_env": "META_ACCESS_TOKEN_XDENTAL_NEW"},
    {"key": "low_attachments", "name": "Attachments", "funnel": "Low Tickets", "account": "act_1466745004611733", "token_env": "META_ACCESS_TOKEN_ATTACHMENTS"},
    {"key": "low_mandamientos", "name": "13 Mandamientos", "funnel": "Low Tickets", "account": "act_1365572205416501", "token_env": "META_ACCESS_TOKEN_13_MANDAMIENTOS"},
    {"key": "launch_clinica", "name": "Clínica de Maestría", "funnel": "Lançamentos", "account": "act_910603368132181", "token_env": "META_ACCESS_TOKEN_XDENTAL_NEW", "campaign_contains": ["cdm", "clinica", "clínica", "maestria", "maestría", "cbm"]},
]

FUNNEL_RULES = [
    ("Low Tickets", lambda p: p.get("product_id") in LOW_TICKET_IDS or any(x in p.get("product_name", "").lower() for x in ["traccion", "tracción", "mesial", "complicaciones", "attachments", "mandamientos", "flujo"])),
    ("Plataforma de Assinatura", lambda p: any(x in p.get("product_name", "").lower() for x in ["excellence dental academy", "club", "mensual", "assinatura", "subscription"])),
    ("Sniper VIP", lambda p: "vip" in p.get("product_name", "").lower()),
    ("Sniper Elite", lambda p: "elite" in p.get("product_name", "").lower()),
    ("Diplomado", lambda p: "diplomado" in p.get("product_name", "").lower()),
    ("Lançamentos", lambda p: any(x in p.get("product_name", "").lower() for x in ["clinica", "clínica", "replay", "combo"])),
]

FX_FALLBACK = {"USD": 5.35, "BRL": 1.0, "EUR": 5.85, "MXN": 0.29, "COP": 0.00135, "CLP": 0.0057, "PEN": 1.45, "ARS": 0.0044, "GTQ": 0.66}
FX_TO_BRL = dict(FX_FALLBACK)


def refresh_fx():
    """Best-effort live FX. open.er-api returns currency units per 1 BRL."""
    global FX_TO_BRL
    try:
        r = requests.get("https://open.er-api.com/v6/latest/BRL", timeout=12)
        r.raise_for_status()
        body = r.json()
        rates = body.get("rates") or {}
        live = {"BRL": 1.0}
        for cur, per_brl in rates.items():
            try:
                if float(per_brl):
                    live[cur.upper()] = 1.0 / float(per_brl)
            except Exception:
                pass
        live.update({k: live.get(k, v) for k, v in FX_FALLBACK.items()})
        FX_TO_BRL = live
    except Exception:
        FX_TO_BRL = dict(FX_FALLBACK)


def load_env():
    env = dict(os.environ)
    if LEGACY_ENV.exists():
        for raw in LEGACY_ENV.read_text(errors="ignore").splitlines():
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    return env


def brl(value, currency):
    return float(value or 0) * FX_TO_BRL.get((currency or "USD").upper(), FX_FALLBACK.get((currency or "USD").upper(), 1.0))


def day_key(dt):
    return dt.astimezone(BRT).date().isoformat()


def classify(product):
    for name, pred in FUNNEL_RULES:
        try:
            if pred(product):
                return name
        except Exception:
            pass
    return "Outros"


def hotmart_token(client_id, client_secret):
    auth = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    r = requests.post(
        "https://api-sec-vlc.hotmart.com/security/oauth/token",
        headers={"Authorization": "Basic " + auth, "Content-Type": "application/x-www-form-urlencoded"},
        data="grant_type=client_credentials",
        timeout=30,
    )
    r.raise_for_status()
    return r.json()["access_token"]


def ms(dt):
    return int(dt.timestamp() * 1000)


def hotmart_sales(label, client_id, client_secret, start, end):
    token = hotmart_token(client_id, client_secret)
    url = "https://developers.hotmart.com/payments/api/v1/sales/history"
    headers = {"Authorization": "Bearer " + token}
    params = {"max_results": 500, "start_date": ms(start), "end_date": ms(end)}
    items = []
    page = None
    pages = 0
    while True:
        q = dict(params)
        if page:
            q["page_token"] = page
        r = requests.get(url, headers=headers, params=q, timeout=60)
        r.raise_for_status()
        body = r.json()
        pages += 1
        for it in body.get("items", []):
            purchase = it.get("purchase") or {}
            status = purchase.get("status")
            if status not in ("APPROVED", "COMPLETE"):
                continue
            product = it.get("product") or {}
            price = purchase.get("price") or {}
            approved = purchase.get("approved_date") or purchase.get("order_date") or purchase.get("date")
            try:
                dt = datetime.fromtimestamp(int(approved) / 1000, tz=BRT)
            except Exception:
                dt = NOW
            product_id = product.get("id") or product.get("ucode")
            try:
                product_id = int(product_id)
            except Exception:
                pass
            product_name = product.get("name") or product.get("title") or "Hotmart — Produto sem nome"
            product_name_l = product_name.lower()
            if any(term in product_name_l for term in EXCLUDED_PRODUCT_TERMS):
                continue
            # RX Digital só entra no dashboard XDental quando for produto antigo/recorrente da própria XDental.
            # Produtos de Johnny/Manu (ex.: La7 Lace) ficam fora para não contaminar a visão financeira XDental.
            if label == "Hotmart RX" and not any(term in product_name_l for term in RX_XDENTAL_ALLOWED_TERMS):
                continue
            currency = (price.get("currency_code") or price.get("currency") or "USD").upper()
            value = float(price.get("value") or 0)
            row = {
                "source": label,
                "account": label,
                "platform": "Hotmart",
                "date": day_key(dt),
                "product_id": product_id,
                "product_name": product_name,
                "currency": currency,
                "gross_original": value,
                "gross_brl_est": brl(value, currency),
                "funnel": classify({"product_id": product_id, "product_name": product_name}),
                "transaction_id": purchase.get("transaction") or purchase.get("order_id"),
            }
            items.append(row)
        page = (body.get("page_info") or {}).get("next_page_token")
        if not page or pages >= 100:
            break
    return items


def source_1password_env():
    p = Path("/root/.openclaw/secrets/1password_service_account.env")
    if not p.exists():
        return
    for raw in p.read_text(errors="ignore").splitlines():
        if raw.strip() and not raw.lstrip().startswith("#") and "=" in raw:
            k, v = raw.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def stripe_key_from_item(item):
    source_1password_env()
    out = subprocess.check_output(["op", "item", "get", item, "--vault", "TAOS", "--format", "json"], text=True)
    data = json.loads(out)
    text = data.get("notesPlain") or ""
    for f in data.get("fields", []) or []:
        text += "\n" + str(f.get("value") or "")
    m = re.search(r"(?:sk|rk)_(?:live|test)_[A-Za-z0-9_]+", text)
    if not m:
        raise RuntimeError(f"Stripe key não encontrada no item {item}")
    return m.group(0)


def stripe_charges(account_label, item_name, start, end):
    key = stripe_key_from_item(item_name)
    created_gte = int(start.timestamp())
    created_lte = int(end.timestamp())
    items = []
    starting_after = None
    # Charges are enough for revenue view MVP; later we can reconcile with balance_transactions/net/fees.
    while True:
        params = {"limit": 100, "created[gte]": created_gte, "created[lte]": created_lte}
        if starting_after:
            params["starting_after"] = starting_after
        r = requests.get(
            "https://api.stripe.com/v1/charges?" + urlencode(params),
            auth=(key, ""),
            timeout=45,
        )
        r.raise_for_status()
        body = r.json()
        for ch in body.get("data", []):
            if not ch.get("paid") or ch.get("status") != "succeeded":
                continue
            amount = (ch.get("amount") or 0) / 100
            refunded = (ch.get("amount_refunded") or 0) / 100
            net_gross = max(0, amount - refunded)
            currency = (ch.get("currency") or "brl").upper()
            desc = ch.get("description") or (ch.get("metadata") or {}).get("product") or (ch.get("metadata") or {}).get("product_name") or "Stripe — Venda"
            dt = datetime.fromtimestamp(ch.get("created"), tz=timezone.utc).astimezone(BRT)
            product = {"product_name": desc}
            items.append({
                "source": account_label,
                "account": account_label,
                "platform": "Stripe",
                "date": day_key(dt),
                "product_id": None,
                "product_name": desc,
                "currency": currency,
                "gross_original": net_gross,
                "gross_brl_est": brl(net_gross, currency),
                "funnel": classify(product),
                "transaction_id": ch.get("id"),
            })
        if not body.get("has_more") or not body.get("data"):
            break
        starting_after = body["data"][-1]["id"]
    return items


def aggregate(rows):
    by_day = defaultdict(lambda: {"gross_brl_est": 0.0, "orders": 0})
    by_source = defaultdict(lambda: {"gross_brl_est": 0.0, "orders": 0})
    by_funnel = defaultdict(lambda: {"gross_brl_est": 0.0, "orders": 0})
    by_product = defaultdict(lambda: {"gross_brl_est": 0.0, "orders": 0, "platforms": set(), "funnel": "Outros"})
    for r in rows:
        v = r["gross_brl_est"]
        for bucket, key in [(by_day, r["date"]), (by_source, r["source"]), (by_funnel, r["funnel"])]:
            bucket[key]["gross_brl_est"] += v
            bucket[key]["orders"] += 1
        pkey = r["product_name"]
        by_product[pkey]["gross_brl_est"] += v
        by_product[pkey]["orders"] += 1
        by_product[pkey]["platforms"].add(r["platform"])
        by_product[pkey]["funnel"] = r["funnel"]
    def finalize(d):
        out = []
        for k, v in d.items():
            row = {"name": k, **v}
            if isinstance(row.get("platforms"), set):
                row["platforms"] = sorted(row["platforms"])
            row["gross_brl_est"] = round(row["gross_brl_est"], 2)
            out.append(row)
        return out
    days = sorted(finalize(by_day), key=lambda x: x["name"])
    products = sorted(finalize(by_product), key=lambda x: x["gross_brl_est"], reverse=True)[:25]
    sources = sorted(finalize(by_source), key=lambda x: x["gross_brl_est"], reverse=True)
    funnels = sorted(finalize(by_funnel), key=lambda x: x["gross_brl_est"], reverse=True)
    total = round(sum(r["gross_brl_est"] for r in rows), 2)
    today = NOW.date().isoformat()
    today_total = round(sum(r["gross_brl_est"] for r in rows if r["date"] == today), 2)
    return {"total_brl_est": total, "today_brl_est": today_total, "orders": len(rows), "days": days, "sources": sources, "funnels": funnels, "products": products}



def meta_insights(env, specs, start, end):
    rows = []
    errors = []
    start_s = start.date().isoformat()
    end_s = end.date().isoformat()
    for spec in specs:
        token = env.get(spec.get("token_env") or "") or env.get("META_ACCESS_TOKEN_XDENTAL_NEW") or env.get("META_ACCESS_TOKEN")
        if not token:
            errors.append(f"Meta Ads {spec['name']}: token ausente")
            continue
        params = {
            "access_token": token,
            "time_range": json.dumps({"since": start_s, "until": end_s}),
            "level": "campaign",
            "fields": "campaign_id,campaign_name,spend,account_currency,date_start",
            "time_increment": 1,
            "limit": 500,
        }
        url = f"{META_BASE}/{spec['account']}/insights"
        try:
            while url:
                r = requests.get(url, params=params if "?" not in url else None, timeout=45)
                r.raise_for_status()
                body = r.json()
                for it in body.get("data", []) or []:
                    cname = it.get("campaign_name") or "Campanha sem nome"
                    filters = [x.lower() for x in spec.get("campaign_contains") or []]
                    if filters and not any(f in cname.lower() for f in filters):
                        continue
                    currency = (it.get("account_currency") or "BRL").upper()
                    spend = float(it.get("spend") or 0)
                    if spend <= 0:
                        continue
                    rows.append({
                        "source": "Meta Ads",
                        "account": spec["account"],
                        "campaign_id": it.get("campaign_id"),
                        "campaign_name": cname,
                        "date": it.get("date_start") or start_s,
                        "name": spec["name"],
                        "funnel": spec["funnel"],
                        "currency": currency,
                        "spend_original": spend,
                        "spend_brl_est": brl(spend, currency),
                    })
                url = ((body.get("paging") or {}).get("next"))
                params = None
        except Exception as e:
            errors.append(f"Meta Ads {spec['name']}: {e}")
    return rows, errors


def aggregate_spend(month_rows, ytd_rows):
    def group(rows, key):
        d = defaultdict(lambda: {"spend_brl_est": 0.0, "campaigns": 0})
        seen = defaultdict(set)
        for r in rows:
            k = r.get(key) or "Outros"
            d[k]["spend_brl_est"] += r.get("spend_brl_est") or 0
            if r.get("campaign_id") not in seen[k]:
                seen[k].add(r.get("campaign_id"))
                d[k]["campaigns"] += 1
        return sorted(({"name": k, "spend_brl_est": round(v["spend_brl_est"], 2), "campaigns": v["campaigns"]} for k, v in d.items()), key=lambda x: x["spend_brl_est"], reverse=True)
    month_total = round(sum(r.get("spend_brl_est") or 0 for r in month_rows), 2)
    ytd_total = round(sum(r.get("spend_brl_est") or 0 for r in ytd_rows), 2)
    return {
        "source": "Meta Ads",
        "status": "ok" if month_rows or ytd_rows else "setup",
        "month_brl_est": month_total,
        "ytd_brl_est": ytd_total,
        "by_funnel": group(month_rows, "funnel"),
        "by_name": group(month_rows, "name"),
        "campaigns_sample": sorted(month_rows, key=lambda x: x.get("spend_brl_est") or 0, reverse=True)[:25],
    }

def main():
    refresh_fx()
    env = load_env()
    rows = []
    errors = []
    sources_status = []
    source_specs = []
    if env.get("HOTMART_CLIENT_ID") and env.get("HOTMART_CLIENT_SECRET"):
        source_specs.append(("Hotmart XDental", env["HOTMART_CLIENT_ID"], env["HOTMART_CLIENT_SECRET"]))
    if env.get("HOTMART_RX_CLIENT_ID") and env.get("HOTMART_RX_CLIENT_SECRET"):
        source_specs.append(("Hotmart RX", env["HOTMART_RX_CLIENT_ID"], env["HOTMART_RX_CLIENT_SECRET"]))
    for label, cid, sec in source_specs:
        try:
            got = hotmart_sales(label, cid, sec, START_YEAR, NOW)
            rows.extend(got)
            sources_status.append({"source": label, "status": "ok", "orders": len(got)})
        except Exception as e:
            errors.append(f"{label}: {e}")
            sources_status.append({"source": label, "status": "erro", "message": str(e)[:180]})
    for label, item in [("Stripe LLC XDental", "Stripe LLC Xdental"), ("Stripe BR XDental", "Stripe BR Xdental")]:
        try:
            got = stripe_charges(label, item, START_YEAR, NOW)
            rows.extend(got)
            sources_status.append({"source": label, "status": "ok", "orders": len(got)})
        except Exception as e:
            errors.append(f"{label}: {e}")
            sources_status.append({"source": label, "status": "erro", "message": str(e)[:180]})
    ytd_spend_rows, ytd_spend_errors = meta_insights(env, META_SPEND_SPECS, START_YEAR, NOW)
    month_spend_rows = [r for r in ytd_spend_rows if r.get("date", "") >= START_MONTH.date().isoformat()]
    month_spend_errors = []
    for err in month_spend_errors + ytd_spend_errors:
        if err not in errors:
            errors.append(err)
    ad_spend = aggregate_spend(month_spend_rows, ytd_spend_rows)
    if month_spend_rows or ytd_spend_rows:
        sources_status.append({"source": "Meta Ads", "status": "ok", "campaigns": len({r.get("campaign_id") for r in month_spend_rows if r.get("campaign_id")})})
    else:
        sources_status.append({"source": "Meta Ads", "status": "setup", "message": "Sem gasto retornado nos mapeamentos atuais"})
    month_rows = [r for r in rows if r.get("date", "") >= START_MONTH.date().isoformat()]
    # fill missing last-14 day line with zero days
    agg = aggregate(month_rows)
    existing = {d["name"]: d for d in agg["days"]}
    line = []
    for i in range(14):
        d = (START_14D + timedelta(days=i)).date().isoformat()
        line.append(existing.get(d, {"name": d, "gross_brl_est": 0, "orders": 0}))
    agg["days_14"] = line
    previous_receivables = None
    if OUT.exists():
        try:
            previous_receivables = (json.loads(OUT.read_text(encoding="utf-8")) or {}).get("receivables")
        except Exception:
            previous_receivables = None
    payload = {
        "generated_at": NOW.isoformat(),
        "timezone": "America/Sao_Paulo",
        "period": {"start": START_MONTH.isoformat(), "end": NOW.isoformat(), "label": NOW.strftime("%B/%Y")},
        "currency_note": "Valores convertidos para BRL com câmbio live best-effort (open.er-api) e fallback operacional quando necessário; próxima etapa: câmbio diário fechado/contábil.",
        "target": {"month_brl": None, "daily_required_brl": None},
        "fx_to_brl_sample": {k: round(FX_TO_BRL.get(k, 0), 6) for k in ["USD", "EUR", "MXN", "ARS", "GTQ", "COP", "CLP", "PEN", "BRL"]},
        "summary": agg,
        "records": [{"date": r.get("date"), "source": r.get("source"), "platform": r.get("platform"), "product_name": r.get("product_name"), "funnel": r.get("funnel"), "gross_brl_est": round(r.get("gross_brl_est") or 0, 2)} for r in rows],
        "ad_spend_records": [{"date": r.get("date"), "name": r.get("name"), "funnel": r.get("funnel"), "campaign_name": r.get("campaign_name"), "spend_brl_est": round(r.get("spend_brl_est") or 0, 2)} for r in ytd_spend_rows],
        "sources_status": sources_status,
        "errors": errors,
        "transactions_sample": rows[:50],
        "ad_spend": ad_spend,
        "receivables": previous_receivables or {
            "status": "setup",
            "source": "Google Sheets — Cobrança Xdental",
            "spreadsheet_id": "1psxy_r11E6g03TudqWBVWjPTJJZOiux-9TsZZHYeYSA",
            "spreadsheet_name": "Cobrança Xdental",
            "source_note": "Planilha localizada via Drive. Parser automático em implantação para colunas CUOTA.",
            "months": [],
            "pending_brl": 0,
            "pending_installments": 0,
            "at_risk_count": 0,
        },
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"out": str(OUT), "orders": len(rows), "total_brl_est": agg["total_brl_est"], "errors": errors, "sources_status": sources_status}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
