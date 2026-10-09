<script setup>
import { ref } from "vue";
import { getLaporanBarang, exportLaporanBarang } from "@/services/barangService";
import { getKategori } from "@/services/kategoriService";
import { downloadBlob } from "@/utils/downloadBlob";
import { ElMessage } from "element-plus";
import { onMounted } from "vue";

const kategoriList = ref([]);
const list = ref([]);
const loading = ref(false);
const exporting = ref(false);
const sudahCari = ref(false);

const filters = ref({
    tanggal_awal: "",
    tanggal_akhir: "",
    id_kategori: "",
    jenis_barang: ""
});

const fetchKategori = async () => {
    const res = await getKategori({ limit: 100 });
    kategoriList.value = res.data.data;
};

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
        const res = await getLaporanBarang(filters.value);
        list.value = res.data.data;
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
        const res = await exportLaporanBarang(filters.value);
        downloadBlob(res.data, `laporan-barang_${filters.value.tanggal_awal}_sd_${filters.value.tanggal_akhir}.csv`);
        ElMessage.success("CSV berhasil diunduh");
    } catch (error) {
        ElMessage.error("Gagal mengunduh CSV");
    } finally {
        exporting.value = false;
    }
};

onMounted(fetchKategori);
</script>

<template>
    <div>
        <h2>Laporan Pergerakan Stok Barang</h2>
        <p class="text-muted">Pilih rentang tanggal untuk melihat dan mengunduh ringkasan stok awal, masuk, keluar, dan stok akhir per barang.</p>

        <div class="filter-row">
            <el-date-picker v-model="filters.tanggal_awal" type="date" placeholder="Tanggal awal" value-format="YYYY-MM-DD" />
            <el-date-picker v-model="filters.tanggal_akhir" type="date" placeholder="Tanggal akhir" value-format="YYYY-MM-DD" />
            <el-select v-model="filters.id_kategori" placeholder="Semua kategori" clearable style="width: 200px">
                <el-option v-for="k in kategoriList" :key="k.id_kategori" :label="k.nama_kategori" :value="k.id_kategori" />
            </el-select>
            <el-select v-model="filters.jenis_barang" placeholder="Semua jenis" clearable style="width: 180px">
                <el-option label="Habis pakai" value="habis_pakai" />
                <el-option label="Tidak habis pakai" value="tidak_habis_pakai" />
            </el-select>
            <el-button type="primary" @click="handleLihat">Lihat Laporan</el-button>
            <el-button :loading="exporting" @click="handleExport">
                <i class="ti ti-download"></i>&nbsp;Unduh CSV
            </el-button>
        </div>

        <div class="table-scroll" v-if="sudahCari">
            <el-table :data="list" v-loading="loading" stripe style="width: 100%; min-width: 700px">
                <el-table-column prop="nama_barang" label="Nama barang" />
                <el-table-column prop="kategori" label="Kategori" />
                <el-table-column prop="jenis_barang" label="Jenis" />
                <el-table-column prop="stok_awal" label="Stok awal" width="100" />
                <el-table-column prop="total_masuk" label="Total masuk" width="110" />
                <el-table-column prop="total_keluar" label="Total keluar" width="110" />
                <el-table-column prop="stok_akhir" label="Stok akhir" width="100" />
            </el-table>
        </div>
    </div>
</template>

<style scoped>
.text-muted { color: #6b7280; margin-bottom: 20px; }
.filter-row { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
</style>