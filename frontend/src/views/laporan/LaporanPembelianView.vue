<script setup>
import { ref } from "vue";
import { getRekapBulanan, exportNotaPembelian, getNotaPembelian } from "@/services/notaPembelianService";
import { downloadBlob } from "@/utils/downloadBlob";
import { ElMessage } from "element-plus";

const filters = ref({ tanggal_awal: "", tanggal_akhir: "" });
const loading = ref(false);
const exporting = ref(false);
const sudahCari = ref(false);
const rekap = ref({ totalKeseluruhan: 0, jumlahNota: 0, perSupplier: [] });
const notaList = ref([]);

const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka || 0);

const isRentangValid = () => {
    if (!filters.value.tanggal_awal || !filters.value.tanggal_akhir) {
        ElMessage.warning("Pilih rentang tanggal awal dan akhir terlebih dahulu");
        return false;
    }
    return true;
};

const handleLihat = async () => {
    if (!isRentangValid()) return;
    loading.value = true;
    try {
        const [resRekap, resNota] = await Promise.all([
            getRekapBulanan(filters.value),
            getNotaPembelian({ ...filters.value, limit: 100 })
        ]);
        rekap.value = resRekap.data.data;
        notaList.value = resNota.data.data;
        sudahCari.value = true;
    } catch (error) {
        ElMessage.error(error.response?.data?.message || "Gagal memuat laporan");
    } finally {
        loading.value = false;
    }
};

const handleExport = async () => {
    if (!isRentangValid()) return;
    exporting.value = true;
    try {
        const res = await exportNotaPembelian(filters.value);
        downloadBlob(res.data, `laporan-pembelian_${filters.value.tanggal_awal}_sd_${filters.value.tanggal_akhir}.csv`);
        ElMessage.success("CSV berhasil diunduh");
    } catch (error) {
        ElMessage.error("Gagal mengunduh CSV");
    } finally {
        exporting.value = false;
    }
};
</script>

<template>
    <div>
        <h2>Laporan Pembelian</h2>
        <p class="text-muted">Total pengeluaran pembelian barang dalam suatu rentang tanggal, beserta rincian per supplier.</p>

        <div class="filter-row">
            <el-date-picker v-model="filters.tanggal_awal" type="date" placeholder="Tanggal awal" value-format="YYYY-MM-DD" />
            <el-date-picker v-model="filters.tanggal_akhir" type="date" placeholder="Tanggal akhir" value-format="YYYY-MM-DD" />
            <el-button type="primary" @click="handleLihat">Lihat Laporan</el-button>
            <el-button :loading="exporting" @click="handleExport">
                <i class="ti ti-download"></i>&nbsp;Unduh CSV
            </el-button>
        </div>

        <template v-if="sudahCari">
            <div class="summary-grid" v-loading="loading">
                <el-card shadow="never">
                    <div class="summary-label">Total pengeluaran</div>
                    <div class="summary-value">{{ formatRupiah(rekap.totalKeseluruhan) }}</div>
                </el-card>
                <el-card shadow="never">
                    <div class="summary-label">Jumlah nota</div>
                    <div class="summary-value">{{ rekap.jumlahNota }}</div>
                </el-card>
            </div>

            <h3 class="section-title">Total per supplier</h3>
            <el-table :data="rekap.perSupplier" stripe style="width: 100%; margin-bottom: 24px">
                <el-table-column prop="nama_supplier" label="Supplier" />
                <el-table-column label="Total belanja" width="180">
                    <template #default="{ row }">{{ formatRupiah(row.total) }}</template>
                </el-table-column>
            </el-table>

            <h3 class="section-title">Daftar nota dalam periode ini</h3>
            <div class="table-scroll">
                <el-table :data="notaList" stripe style="width: 100%; min-width: 600px">
                    <el-table-column prop="tanggal" label="Tanggal" width="110" />
                    <el-table-column label="Nomor nota" width="130">
                        <template #default="{ row }">{{ row.nomor_nota || "-" }}</template>
                    </el-table-column>
                    <el-table-column label="Supplier">
                        <template #default="{ row }">{{ row.Supplier?.nama_supplier || "-" }}</template>
                    </el-table-column>
                    <el-table-column label="Total" width="140">
                        <template #default="{ row }">{{ formatRupiah(row.total_harga) }}</template>
                    </el-table-column>
                </el-table>
            </div>
        </template>
    </div>
</template>

<style scoped>
.text-muted { color: #6b7280; margin-bottom: 20px; }
.filter-row { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
.summary-label { font-size: 13px; color: #6b7280; margin-bottom: 6px; }
.summary-value { font-size: 24px; font-weight: 600; }
.section-title { font-size: 15px; font-weight: 500; margin: 0 0 12px; }
.table-scroll { overflow-x: auto; }
</style>