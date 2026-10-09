import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

const routes = [
    { path: "/login", name: "login", component: () => import("@/views/auth/LoginView.vue") },
    {
        path: "/",
        name: "dashboard",
        component: () => import("@/views/DashboardView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/barang",
        name: "barang",
        component: () => import("@/views/barang/BarangListView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/barang/tambah",
        name: "barang-tambah",
        component: () => import("@/views/barang/BarangFormView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/barang/edit/:id",
        name: "barang-edit",
        component: () => import("@/views/barang/BarangFormView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/kategori",
        name: "kategori",
        component: () => import("@/views/kategori/KategoriListView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/kategori/tambah",
        name: "kategori-tambah",
        component: () => import("@/views/kategori/KategoriFormView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/kategori/edit/:id",
        name: "kategori-edit",
        component: () => import("@/views/kategori/KategoriFormView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/lokasi",
        name: "lokasi",
        component: () => import("@/views/lokasi/LokasiListView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/lokasi/tambah",
        name: "lokasi-tambah",
        component: () => import("@/views/lokasi/LokasiFormView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/lokasi/edit/:id",
        name: "lokasi-edit",
        component: () => import("@/views/lokasi/LokasiFormView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/supplier",
        name: "supplier",
        component: () => import("@/views/supplier/SupplierListView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/supplier/tambah",
        name: "supplier-tambah",
        component: () => import("@/views/supplier/SupplierFormView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/supplier/edit/:id",
        name: "supplier-edit",
        component: () => import("@/views/supplier/SupplierFormView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/nota-pembelian",
        name: "nota-pembelian",
        component: () => import("@/views/nota/NotaPembelianListView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/nota-pembelian/tambah",
        name: "nota-pembelian-tambah",
        component: () => import("@/views/nota/NotaPembelianFormView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/nota-pembelian/:id",
        name: "nota-pembelian-detail",
        component: () => import("@/views/nota/NotaPembelianDetailView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/laporan-pembelian",
        name: "laporan-pembelian",
        component: () => import("@/views/laporan/LaporanPembelianView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/transaksi-keluar",
        name: "transaksi-keluar",
        component: () => import("@/views/transaksi/TransaksiKeluarView.vue"),
        meta: { requiresAuth: true }
    },

    {
        path: "/laporan-barang",
        name: "laporan-barang",
        component: () => import("@/views/barang/LaporanBarangView.vue"),
        meta: { requiresAuth: true }
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to) => {
    const authStore = useAuthStore();

    if (!authStore.user && to.name !== "login") {
        await authStore.fetchMe();
    }

    if (to.meta.requiresAuth && !authStore.user) {
        return { name: "login" };
    }
});

export default router;