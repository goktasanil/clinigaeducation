from cliniga_intelligence.economics import ProductEconomics, optimize_sale_price


def test_optimizer_never_recommends_below_sustainable_floor() -> None:
    product = ProductEconomics(name="Dayanıklı ürün", market_price=1_000, shipping_cost=70)
    result = optimize_sale_price(product, trials=20)
    assert result["recommended_price"] >= round(product.sustainable_floor, 2)
    assert result["unit_profit"] > 0


def test_invalid_combined_rates_fail_closed() -> None:
    product = ProductEconomics(
        name="Riskli ürün",
        market_price=100,
        commission_rate=0.4,
        tax_reserve_rate=0.3,
        inflation_reserve_rate=0.2,
        target_margin_rate=0.1,
    )
    try:
        _ = product.sustainable_floor
    except ValueError as error:
        assert "no sustainable" in str(error)
    else:
        raise AssertionError("Unsustainable rates must fail closed")
