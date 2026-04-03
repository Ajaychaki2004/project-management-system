import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { callApi } from "../lib/api";
import { clearToken, getToken, parseJwt } from "../lib/session";
import { useToast } from "../components/ToastProvider";

function ProductManagementPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
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
  const productsPerPage = 6;

  const totalProducts = products.length;
  const inventoryValue = products.reduce((total, product) => {
    const value = Number(product.price);
    return total + (Number.isNaN(value) ? 0 : value);
  }, 0);

  const totalPages = Math.max(1, Math.ceil(totalProducts / productsPerPage));
  const startIndex = (currentPage - 1) * productsPerPage;
  const pagedProducts = products.slice(startIndex, startIndex + productsPerPage);

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

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
      setCurrentPage(1);
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
    <main className="pm-page-shell">
      <header className="pm-header">
        <div>
          <h1>Product Management</h1>
          <p>Logged in as {currentUser?.email || "User"}</p>
        </div>
        <button type="button" className="pm-logout-btn" onClick={requestLogout}>
          Logout
        </button>
      </header>

      <hr className="pm-separator" />

      <section className="pm-content-grid">
        <article className="pm-card pm-add-product-card">
          <h2>Add New Product</h2>
          <form onSubmit={onCreateProduct} className="pm-form">
            <label>
              Product Name
              <input
                type="text"
                placeholder="e.g Macbook Pro"
                value={newProduct.name}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </label>
            <label>
              Price (Rs.)
              <input
                type="number"
                placeholder="0.00"
                value={newProduct.price}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
                required
              />
            </label>
            <button type="submit" className="pm-primary-btn" disabled={loading}>
              Create Product
            </button>
          </form>
        </article>

        <div className="pm-right-panel">
          <div className="pm-stats-grid">
            <article className="pm-card pm-stat-card">
              <p>Total Products</p>
              <h3>{totalProducts}</h3>
            </article>
            <article className="pm-card pm-stat-card">
              <p>Inventory Value</p>
              <h3>Rs. {inventoryValue.toLocaleString("en-IN")}</h3>
            </article>
          </div>

          <div className="pm-products-grid">
            {pagedProducts.length === 0 ? <p className="empty">No products yet.</p> : null}
            {pagedProducts.map((product) => (
              <article className="pm-card pm-product-card" key={product.id}>
                {editingId === product.id ? (
                  <>
                    <div className="pm-edit-fields">
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
                    </div>
                    <div className="pm-card-actions">
                      <button type="button" className="pm-primary-btn" onClick={() => onUpdateProduct(product.id)}>
                        Save
                      </button>
                      <button
                        type="button"
                        className="pm-primary-btn"
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
                    <div className="pm-product-meta">
                      <h3>{product.name}</h3>
                      <p>Rs. {Number(product.price).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="pm-card-actions">
                      <button type="button" className="pm-primary-btn" onClick={() => startEdit(product)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="pm-primary-btn"
                        onClick={() => confirmDeleteProduct(product)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>

          <div className="pm-pagination-wrap">
            <div className="pm-separator" />
            <div className="pm-pagination">
              <button
                type="button"
                className="pm-page-btn"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="pm-page-btn"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
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
