import { AppShell } from "@/components/app-shell";
import { cookies } from "next/headers";
import { Locale, getTranslation } from "@/lib/translations";

export const dynamic = "force-dynamic";

// Static menu items for demonstration
const menuItems = [
  { id: 1, name: "Shiro Wot", category: "LUNCH", price: 15, description: "Spiced chickpea stew served with injera.", icon: "🫘" },
  { id: 2, name: "Beyaynetu", category: "LUNCH", price: 20, description: "Mixed vegetarian fasting platter.", icon: "🥗" },
  { id: 3, name: "Fitti (Firfir)", category: "BREAKFAST", price: 12, description: "Torn injera mixed with berbere sauce.", icon: "🫓" },
  { id: 4, name: "Genfo (Porridge)", category: "BREAKFAST", price: 10, description: "Barley porridge served with spiced butter.", icon: "🥣" },
  { id: 5, name: "Tibs (Sautéed Beef)", category: "DINNER", price: 35, description: "Pan-fried beef with onion and rosemary.", icon: "🥩" },
  { id: 6, name: "Kategna", category: "BREAKFAST", price: 8, description: "Toasted injera with berbere and niter kibbeh.", icon: "🫓" },
  { id: 7, name: "Kitfo", category: "DINNER", price: 40, description: "Minced raw or lightly cooked beef with mitmita.", icon: "🍖" },
  { id: 8, name: "Misir Wot", category: "LUNCH", price: 12, description: "Red lentil stew with berbere and spices.", icon: "🫘" },
];

const categoryColors: Record<string, string> = {
  BREAKFAST: "badge-warning",
  LUNCH: "badge-secondary",
  DINNER: "badge-muted",
};

const categoryLabels: Record<string, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
};

export default async function MenuPage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);

  return (
    <AppShell
      title="Menu Management"
      subtitle="Manage the daily food items available at the CTBE Cafe. Add, edit, or remove menu items per meal period."
    >
      {/* Controls bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span className="form-label" style={{ marginBottom: 0 }}>Category:</span>
          {["All", "Breakfast", "Lunch", "Dinner"].map((cat) => (
            <button
              key={cat}
              type="button"
              style={{
                padding: "5px 14px",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: 500,
                border: "1px solid var(--border)",
                background: cat === "All" ? "var(--brand)" : "#fff",
                color: cat === "All" ? "#fff" : "var(--foreground)",
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn-primary"
        >
          + Add New Item
        </button>
      </div>

      {/* Menu Items Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {menuItems.map((item) => (
          <div key={item.id} className="menu-card">
            {/* Image placeholder */}
            <div className="menu-card-img">
              <span style={{ fontSize: "56px" }}>{item.icon}</span>
            </div>
            <div className="menu-card-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                <p style={{ fontWeight: 600, fontSize: "15px", color: "var(--foreground)" }}>{item.name}</p>
                <span className={`badge ${categoryColors[item.category]}`} style={{ fontSize: "11px", flexShrink: 0 }}>
                  {categoryLabels[item.category]}
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--muted)", flex: 1 }}>{item.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                <p style={{ fontWeight: 700, fontSize: "16px", color: "var(--brand)" }}>
                  {item.price} <span style={{ fontSize: "12px", fontWeight: 400 }}>Birr</span>
                </p>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button type="button" className="btn-navy" style={{ padding: "4px 10px", fontSize: "12px" }}>
                    Edit
                  </button>
                  <button type="button" className="btn-danger-outline" style={{ padding: "4px 10px", fontSize: "12px" }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Card Placeholder */}
        <div
          style={{
            border: "2px dashed var(--border)",
            borderRadius: "6px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            minHeight: "220px",
            color: "var(--muted)",
            cursor: "pointer",
            transition: "border-color 0.15s, color 0.15s",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "32px" }}>＋</span>
          <span style={{ fontSize: "14px", fontWeight: 500 }}>Add New Menu Item</span>
        </div>
      </div>

      {/* Add Item Form Panel */}
      <div className="panel">
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "var(--brand-soft)" }}>
          <h2 className="text-section-heading">Add / Edit Menu Item</h2>
        </div>
        <div style={{ padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div>
              <label className="form-label">Item Name</label>
              <input type="text" className="form-input" placeholder="e.g. Shiro Wot" />
            </div>
            <div>
              <label className="form-label">Category</label>
              <select className="form-input">
                <option value="">Select category</option>
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="DINNER">Dinner</option>
              </select>
            </div>
            <div>
              <label className="form-label">Price (Birr)</label>
              <input type="number" className="form-input" placeholder="15" min={0} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Brief description of the dish..."
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            <button type="button" className="btn-primary">Save Item</button>
            <button type="button" className="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
