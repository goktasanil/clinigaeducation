from __future__ import annotations

import math
from dataclasses import asdict, dataclass

import optuna


@dataclass(frozen=True)
class ProductEconomics:
    name: str
    market_price: float
    purchase_discount: float = 0.30
    shipping_cost: float = 85.0
    commission_rate: float = 0.20
    tax_reserve_rate: float = 0.08
    inflation_reserve_rate: float = 0.05
    target_margin_rate: float = 0.15
    baseline_monthly_units: float = 20.0
    price_elasticity: float = 2.0

    def __post_init__(self) -> None:
        if self.market_price <= 0 or self.shipping_cost < 0:
            raise ValueError("Prices must be positive and shipping cannot be negative")
        for value in (
            self.purchase_discount,
            self.commission_rate,
            self.tax_reserve_rate,
            self.inflation_reserve_rate,
            self.target_margin_rate,
        ):
            if not 0 <= value < 1:
                raise ValueError("Rates must be between 0 and 1")

    @property
    def purchase_price(self) -> float:
        return self.market_price * (1 - self.purchase_discount)

    @property
    def sustainable_floor(self) -> float:
        variable_rate = (
            self.commission_rate
            + self.tax_reserve_rate
            + self.inflation_reserve_rate
            + self.target_margin_rate
        )
        if variable_rate >= 1 or math.isclose(variable_rate, 1, rel_tol=0, abs_tol=1e-12):
            raise ValueError("Combined variable rates leave no sustainable sale price")
        return (self.purchase_price + self.shipping_cost) / (1 - variable_rate)

    def unit_profit(self, sale_price: float) -> float:
        variable_cost = sale_price * (
            self.commission_rate + self.tax_reserve_rate + self.inflation_reserve_rate
        )
        return sale_price - self.purchase_price - self.shipping_cost - variable_cost

    def expected_monthly_profit(self, sale_price: float) -> float:
        demand = self.baseline_monthly_units * math.exp(
            -self.price_elasticity * ((sale_price / self.market_price) - 1)
        )
        return max(demand, 0) * self.unit_profit(sale_price)


def optimize_sale_price(product: ProductEconomics, trials: int = 80) -> dict[str, float | str]:
    low = max(product.sustainable_floor, product.market_price * 0.75)
    high = max(low * 1.05, product.market_price * 1.5)
    sampler = optuna.samplers.TPESampler(seed=42)
    study = optuna.create_study(direction="maximize", sampler=sampler)
    optuna.logging.set_verbosity(optuna.logging.WARNING)

    def objective(trial: optuna.Trial) -> float:
        price = trial.suggest_float("sale_price", low, high)
        return product.expected_monthly_profit(price)

    study.optimize(objective, n_trials=max(10, trials), show_progress_bar=False)
    best_price = float(study.best_params["sale_price"])
    return {
        "name": product.name,
        "market_price": round(product.market_price, 2),
        "purchase_price": round(product.purchase_price, 2),
        "sustainable_floor": round(product.sustainable_floor, 2),
        "recommended_price": round(best_price, 2),
        "unit_profit": round(product.unit_profit(best_price), 2),
        "expected_monthly_profit": round(product.expected_monthly_profit(best_price), 2),
    }


def product_as_dict(product: ProductEconomics) -> dict[str, object]:
    return asdict(product)
