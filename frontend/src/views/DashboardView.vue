<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { getBarang } from "@/services/barangService";
import { getNotaPembelian } from "@/services/notaPembelianService";
import { getTransaksiKeluar } from "@/services/transaksiKeluarService";
import { getKategori } from "@/services/kategoriService";
import { getSupplier } from "@/services/supplierService";
import { ElMessage } from "element-plus";
import {
    Box, Warning, Files,
    ShoppingCart, TrendCharts
} from "@element-plus/icons-vue";

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const stats = ref({
    totalBarang: 0,
    stokMenipis: 0,
    totalKategori: 0,
    totalSupplier: 0,
    notaBulanIni: 0,
    transaksiKeluarBulanIni: 0
});

const barangMenipis = ref([]);
const activeTab = ref("masuk");
const notaTerbaru = ref([]);
const transaksiKeluarTerbaru = ref([]);

const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka || 0);

const getRentangBulanIni = () => {
    const now = new Date();
    const awal = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const akhir = now.toISOString().slice(0, 10);
    return { tanggal_awal: awal, tanggal_akhir: akhir };
};

const fetchDashboard = async () => {
    loading.value = true;
    try {
        const rentang = getRentangBulanIni();

        const [resBarang, resMenipis, resKategori, resSupplier, resNotaBulan, resKeluarBulan, resNotaTerbaru, resKeluarTerbaru] =
            await Promise.all([
                getBarang({ limit: 1 }),
                getBarang({ limit: 5, stok_menipis: true }),
                getKategori({ limit: 1 }),
                getSupplier({ limit: 1 }),
                getNotaPembelian({ limit: 1, ...rentang }),
                getTransaksiKeluar({ limit: 1, ...rentang }),
                getNotaPembelian({ limit: 5 }),
                getTransaksiKeluar({ limit: 5 })
            ]);

        stats.value.totalBarang = resBarang.data.pagination.total_data;
        stats.value.stokMenipis = resMenipis.data.pagination.total_data;
        stats.value.totalKategori = resKategori.data.pagination.total_data;
        stats.value.totalSupplier = resSupplier.data.pagination.total_data;
        stats.value.notaBulanIni = resNotaBulan.data.pagination.total_data;
        stats.value.transaksiKeluarBulanIni = resKeluarBulan.data.pagination.total_data;

        barangMenipis.value = resMenipis.data.data;
        notaTerbaru.value = resNotaTerbaru.data.data;
        transaksiKeluarTerbaru.value = resKeluarTerbaru.data.data;
    } catch (error) {
        ElMessage.error("Gagal memuat data dashboard. Coba muat ulang halaman.");
        console.error(error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchDashboard);
</script>

<template>
    <div>
        <div class="page-header">
            <h2>Selamat datang, {{ authStore.user?.nama }}</h2>
            <p class="text-muted">Ringkasan inventaris VTS Merak</p>
        </div>

        <div class="stat-grid" v-loading="loading">
            <el-card class="stat-card" shadow="never">
                <div class="stat-icon c-blue"><el-icon :size="20"><Box /></el-icon></div>
                <div>
                    <div class="stat-label">Total jenis barang</div>
                    <div class="stat-value">{{ stats.totalBarang }}</div>
                </div>
            </el-card>
            <el-card class="stat-card" shadow="never">
                <div class="stat-icon c-amber"><el-icon :size="20"><Warning /></el-icon></div>
                <div>
                    <div class="stat-label">Barang stok menipis</div>
                    <div class="stat-value warning">{{ stats.stokMenipis }}</div>
                </div>
            </el-card>
            <el-card class="stat-card" shadow="never">
                <div class="stat-icon c-green"><el-icon :size="20"><ShoppingCart /></el-icon></div>
                <div>
                    <div class="stat-label">Nota pembelian bulan ini</div>
                    <div class="stat-value">{{ stats.notaBulanIni }}</div>
                </div>
            </el-card>
            <el-card class="stat-card" shadow="never">
                <div class="stat-icon c-coral"><el-icon :size="20"><TrendCharts /></el-icon></div>
                <div>
                    <div class="stat-label">Barang keluar bulan ini</div>
                    <div class="stat-value">{{ stats.transaksiKeluarBulanIni }}</div>
                </div>
            </el-card>
        </div>

        <div class="quick-actions">
            <el-button @click="router.push('/barang/tambah')"><el-icon><Box /></el-icon>&nbsp;Tambah Barang</el-button>
            <el-button @click="router.push('/nota-pembelian/tambah')"><el-icon><ShoppingCart /></el-icon>&nbsp;Catat Nota Pembelian</el-button>
            <el-button @click="router.push('/transaksi-keluar')"><el-icon><TrendCharts /></el-icon>&nbsp;Catat Barang Keluar</el-button>
            <el-button @click="router.push('/laporan-barang')"><el-icon><Files /></el-icon>&nbsp;Lihat Laporan</el-button>
        </div>

        <div class="dashboard-grid">
            <el-card shadow="never" class="panel">
                <div class="panel-header">
                    <h3>Barang stok menipis</h3>
                    <router-link to="/barang?stok_menipis=true" class="panel-link">Lihat semua</router-link>
                </div>
                <el-empty v-if="!loading && barangMenipis.length === 0" description="Tidak ada barang dengan stok menipis" :image-size="70" />
                <div v-else class="menipis-list">
                    <div v-for="b in barangMenipis" :key="b.id_barang" class="menipis-item">
                        <div>
                            <div class="menipis-name">{{ b.nama_barang }}</div>
                            <div class="menipis-sub">{{ b.Kategori?.nama_kategori || "-" }}</div>
                        </div>
                        <el-tag type="danger" size="small">{{ b.stok_saat_ini }} / min {{ b.stok_minimum }} {{ b.satuan }}</el-tag>
                    </div>
                </div>
            </el-card>

            <el-card shadow="never" class="panel">
                <div class="panel-header">
                    <h3>Transaksi terbaru</h3>
                </div>
                <el-tabs v-model="activeTab">
                    <el-tab-pane label="Nota pembelian" name="masuk">
                        <el-empty v-if="!loading && notaTerbaru.length === 0" description="Belum ada nota" :image-size="70" />
                        <div v-else class="trx-list">
                            <div v-for="n in notaTerbaru" :key="n.id_nota" class="trx-item">
                                <div>
                                    <div class="trx-name">{{ n.nomor_nota || `Nota #${n.id_nota}` }}</div>
                                    <div class="trx-sub">{{ n.tanggal }} · {{ n.Supplier?.nama_supplier || "-" }}</div>
                                </div>
                                <span class="trx-jumlah">{{ formatRupiah(n.total_harga) }}</span>
                            </div>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="Barang keluar" name="keluar">
                        <el-empty v-if="!loading && transaksiKeluarTerbaru.length === 0" description="Belum ada transaksi" :image-size="70" />
                        <div v-else class="trx-list">
                            <div v-for="t in transaksiKeluarTerbaru" :key="t.id_transaksi_keluar" class="trx-item">
                                <div>
                                    <div class="trx-name">{{ t.Barang?.nama_barang }}</div>
                                    <div class="trx-sub">{{ t.tanggal }} · {{ t.Lokasi?.nama_lokasi || "-" }}</div>
                                </div>
                                <span class="trx-jumlah out">-{{ t.jumlah }} {{ t.Barang?.satuan }}</span>
                            </div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </el-card>
        </div>
    </div>
</template>

<style scoped>
.page-header { margin-bottom: 24px; }
.text-muted { color: #6b7280; margin-top: 4px; }

.stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
}

.stat-card :deep(.el-card__body) {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px;
}

.stat-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.stat-icon.c-blue { background: #e6f1fb; color: #185fa5; }
.stat-icon.c-amber { background: #faeeda; color: #854f0b; }
.stat-icon.c-green { background: #eaf3de; color: #3b6d11; }
.stat-icon.c-coral { background: #faece7; color: #993c1d; }

.stat-label { font-size: 13px; color: #6b7280; margin-bottom: 2px; }
.stat-value { font-size: 24px; font-weight: 600; }
.stat-value.warning { color: #d97706; }

.quick-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 24px;
}

.dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.panel-header h3 {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
}

.panel-link {
    font-size: 13px;
    color: #3b82f6;
    text-decoration: none;
}

.menipis-list, .trx-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.menipis-item, .trx-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
}

.menipis-item:last-child, .trx-item:last-child {
    border-bottom: none;
}

.menipis-name, .trx-name {
    font-size: 14px;
    font-weight: 500;
}

.menipis-sub, .trx-sub {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 2px;
}

.trx-jumlah {
    font-size: 14px;
    font-weight: 600;
    color: #16a34a;
}

.trx-jumlah.out {
    color: #dc2626;
}

@media (max-width: 900px) {
    .dashboard-grid {
        grid-template-columns: 1fr;
    }
}
</style>