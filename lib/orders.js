import { DEFAULT_WEEKLY_PLAN } from "./constants";
import { getUpcomingWindow } from "./dates";

export function buildDefaultOrderItems(customizationType) {
  const items = DEFAULT_WEEKLY_PLAN.map((name) => ({
    name,
    qty: 1,
    unit_price: 0,
    is_addon: false,
  }));

  if (customizationType === "NO_PORK") {
    return items.map((item) =>
      item.name.toLowerCase().includes("pork")
        ? { ...item, name: "Extra chicken or fish curry" }
        : item
    );
  }

  if (customizationType === "BEEF_GOAT") {
    return items.map((item) =>
      item.name.toLowerCase().includes("pork")
        ? { ...item, name: "Beef/Goat curry", is_addon: true }
        : item
    );
  }

  if (customizationType === "VEGETARIAN") {
    return [
      { name: "Tofu curry", qty: 1, unit_price: 0, is_addon: false },
      { name: "Paneer or chickpea curry", qty: 1, unit_price: 0, is_addon: false },
      { name: "Seasonal vegetable sauté", qty: 1, unit_price: 0, is_addon: false },
      { name: "Vegetarian soup", qty: 1, unit_price: 0, is_addon: false },
      { name: "White rice", qty: 1, unit_price: 0, is_addon: false },
      { name: "Dessert", qty: 1, unit_price: 0, is_addon: false },
      { name: "Tea", qty: 1, unit_price: 0, is_addon: false },
    ];
  }

  return items;
}

export function buildUpcomingWindowPayload(referenceDate = new Date()) {
  const { deliveryDate, cutoffAt } = getUpcomingWindow(referenceDate);
  return {
    delivery_date: deliveryDate.toISOString(),
    cutoff_at: cutoffAt.toISOString(),
  };
}
