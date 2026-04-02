import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { callApi } from "../lib/api";
import { clearToken, getToken, parseJwt } from "../lib/session";
import { useToast } from "../components/ToastProvider";

function ProductManagementPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(false);
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    tone: "danger",
    onConfirm: null,
  });
  const { showToast } = useToast();

  const currentUser = useMemo(() => parseJwt(getToken()), []);

  const loadProducts = async () => {
    try {
      const data = await callApi("/api/products/get", { method: "GET" }, true);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast(error.message, "error");
      if (error.message === "Invalid token" || error.message === "Unauthorized") {
        clearToken();
        navigate("/auth", { replace: true });
      }
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onCreateProduct = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await callApi(
        "/api/products/create",
        {
          method: "POST",
          body: JSON.stringify(newProduct),
        },
        true,
      );
      setNewProduct({ name: "", price: "" });
      showToast("Product created.", "success");
      await loadProducts();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const onUpdateProduct = async (productId) => {
    setLoading(true);

    try {
      await callApi(
        `/api/products/update/${productId}`,
        {
          method: "PUT",
          body: JSON.stringify(editingForm),
        },
        true,
      );
      setEditingId(null);
      setEditingForm({ name: "", price: "" });
      showToast("Product updated.", "success");
      await loadProducts();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const onDeleteProduct = async (productId) => {
    setLoading(true);

    try {
      await callApi(`/api/products/delete/${productId}`, { method: "DELETE" }, true);
      showToast("Product deleted.", "success");
      await loadProducts();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditingForm({ name: product.name, price: String(product.price) });
  };

  const closeConfirmModal = () => {
    setConfirmState((prev) => ({ ...prev, open: false, onConfirm: null }));
  };

  const openConfirmModal = ({ title, message, confirmLabel, onConfirm, tone = "danger" }) => {
    setConfirmState({
      open: true,
      title,
      message,
      confirmLabel,
      tone,
      onConfirm,
    });
  };

  const confirmDeleteProduct = (product) => {
    openConfirmModal({
      title: "Delete product?",
      message: `${product.name} will be permanently removed. This action cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
      onConfirm: async () => {
        await onDeleteProduct(product.id);
      },
    });
  };

  const requestLogout = () => {
    openConfirmModal({
      title: "Logout?",
      message: "You will need to sign in again to continue managing products.",
      confirmLabel: "Logout",
      tone: "default",
      onConfirm: () => {
        logout();
      },
    });
  };

  const handleConfirmAction = async () => {
    const action = confirmState.onConfirm;
    if (!action) {
      return;
    }

    closeConfirmModal();
    await action();
  };

  const logout = () => {
    clearToken();
    navigate("/auth", { replace: true });
  };

  return (
    <main className="page-shell">
      <div className="glow glow-left" />
      <div className="glow glow-right" />

      <section className="panel top-panel">
        <h1>Product Management</h1>
        <p>Track products, update prices, and maintain inventory for your account.</p>
      </section>

      <section className="panel products-panel">
        <div className="panel-toolbar">
          <span>Logged in as {currentUser?.email || "User"}</span>
        </div>

        <form onSubmit={onCreateProduct} className="product-form">
          <input
            type="text"
            placeholder="Product name"
            value={newProduct.name}
            onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
            required
          />
          <button type="submit" disabled={loading}>
            Add Product
          </button>
        </form>

        <div className="product-list">
          {products.length === 0 ? <p className="empty">No products yet.</p> : null}
          {products.map((product) => (
            <div className="product-card" key={product.id}>
              {editingId === product.id ? (
                <>
                  <input
                    type="text"
                    value={editingForm.name}
                    onChange={(e) => setEditingForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                  <input
                    type="number"
                    value={editingForm.price}
                    onChange={(e) => setEditingForm((prev) => ({ ...prev, price: e.target.value }))}
                  />
                  <div className="card-actions">
                    <button type="button" onClick={() => onUpdateProduct(product.id)}>
                      Save
                    </button>
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => {
                        setEditingId(null);
                        setEditingForm({ name: "", price: "" });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3>{product.name}</h3>
                    <p>Rs. {product.price}</p>
                  </div>
                  <div className="card-actions">
                    <button type="button" onClick={() => startEdit(product)}>
                      Edit
                    </button>
                    <button type="button" className="danger" onClick={() => confirmDeleteProduct(product)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="panel-footer-actions">
          <button type="button" className="ghost-btn" onClick={requestLogout}>
            Logout
          </button>
        </div>
      </section>

      {confirmState.open ? (
        <div className="modal-backdrop" role="presentation" onClick={closeConfirmModal}>
          <div
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="confirm-modal-title">{confirmState.title}</h2>
            <p>{confirmState.message}</p>
            <div className="confirm-modal-actions">
              <button type="button" className="ghost-btn" onClick={closeConfirmModal} disabled={loading}>
                Cancel
              </button>
              <button
                type="button"
                className={confirmState.tone === "danger" ? "danger" : ""}
                onClick={handleConfirmAction}
                disabled={loading}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default ProductManagementPage;
