from __future__ import annotations

import streamlit as st

from cliniga_intelligence.economics import ProductEconomics, optimize_sale_price
from cliniga_intelligence.health import capability_status

st.set_page_config(page_title="CliniGA Intelligence", page_icon="🧠", layout="wide")
st.title("CliniGA Research & Marketplace Intelligence")
st.caption("Atıflı tez araştırması ve sürdürülebilir Trendyol kâr analizi")

with st.sidebar:
    st.subheader("Kurulum durumu")
    st.json(capability_status())

st.subheader("Ürün kârlılık optimizasyonu")
left, right = st.columns(2)
with left:
    name = st.text_input("Ürün", "Örnek ürün")
    market_price = st.number_input("Piyasa fiyatı (₺)", min_value=1.0, value=1000.0)
    purchase_discount = st.slider("Alış indirimi", 0.0, 0.8, 0.30)
    shipping = st.number_input("Kargo (₺)", min_value=0.0, value=85.0)
with right:
    commission = st.slider("Komisyon", 0.0, 0.5, 0.20)
    tax_reserve = st.slider("Vergi/rezerv", 0.0, 0.4, 0.08)
    inflation_reserve = st.slider("Enflasyon rezervi", 0.0, 0.4, 0.05)
    target_margin = st.slider("Hedef sürdürülebilir marj", 0.0, 0.5, 0.15)

if st.button("Fiyatı optimize et", type="primary"):
    product = ProductEconomics(
        name=name,
        market_price=market_price,
        purchase_discount=purchase_discount,
        shipping_cost=shipping,
        commission_rate=commission,
        tax_reserve_rate=tax_reserve,
        inflation_reserve_rate=inflation_reserve,
        target_margin_rate=target_margin,
    )
    st.json(optimize_sale_price(product))

st.info(
    "Trendyol mağaza işlemleri bu panelde salt-okunurdur. Gerçek satış yazmaları ayrı onay ve "
    "üretim anahtarı gerektirir."
)
