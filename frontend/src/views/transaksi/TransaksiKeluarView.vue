<script setup>
import { ref, onMounted } from "vue";
import { getTransaksiKeluar } from "@/services/transaksiKeluarService";
import { getBarang } from "@/services/barangService";
import { ElMessage } from "element-plus";
import TransaksiKeluarFormDialog from "./TransaksiKeluarFormDialog.vue";
import { exportTransaksiKeluar } from "@/services/transaksiKeluarService";
import { downloadBlob } from "@/utils/downloadBlob";

const list = ref([]);
const barangList = ref([]);
const loading = ref(false);
const showForm = ref(false);

const filters = ref({ id_barang: "", tanggal_awal: "", tanggal_akhir: "", page: 1, limit: 10 });
const pagination = ref({ total_data: 0 });

const fetchBarang = async () => {
    const res = await getBarang({ limit: 100 });
    barangList.value = res.data.data.sort((a, b) =>
        a.nama_barang.localeCompare(b.nama_barang, "id")
    );
};

const fetchData = async () => {
    loading.value = true;
    try {
        const res = await getTransaksiKeluar(filters.value);
        list.value = res.data.data;
        pagination.value = res.data.pagination;
    } catch (error) {
        ElMessage.error("Gagal memuat data transaksi keluar");
    } finally {
        loading.value = false;
    }
};

const handleFilter = () => {
    filters.value.page = 1;
    fetchData();
};

const handlePageChange = (page) => {
    filters.value.page = page;
    fetchData();
};

const handleCreated = () => {
    showForm.value = false;
    fetchData();
};

const exporting = ref(false);

const handleExport = async () => {
    if (!filters.value.tanggal_awal || !filters.value.tanggal_akhir) {
        ElMessage.warning("Pilih rentang tanggal awal dan akhir terlebih dahulu");
        return;
    }
    exporting.value = true;
    try {
        const res = await exportTransaksiKeluar({
            tanggal_awal: filters.value.tanggal_awal,
            tanggal_akhir: filters.value.tanggal_akhir,
            id_barang: filters.value.id_barang
        });
        downloadBlob(res.data, `transaksi-keluar_${filters.value.tanggal_awal}_sd_${filters.value.tanggal_akhir}.csv`);
        ElMessage.success("CSV berhasil diunduh");
    } catch (error) {
        ElMessage.error("Gagal mengunduh CSV. Pastikan rentang tanggal sudah benar.");
    } finally {
        exporting.value = false;
    }
};

onMounted(() => {
    fetchBarang();
    fetchData();
});
</script>

<template>
    <div>
        <div class="header-row">
            <h2>Transaksi Barang Keluar</h2>
            <div class="header-actions">
                <el-button :loading="exporting" @click="handleExport">
                    <i class="ti ti-download"></i>&nbsp;Unduh CSV
                </el-button>
                <el-button type="primary" @click="showForm = true">Catat Barang Keluar</el-button>
            </div>
        </div>

        <div class="filter-row">
            <el-select v-model="filters.id_barang" placeholder="Semua barang" clearable style="width: 220px" @change="handleFilter">
                <el-option v-for="b in barangList" :key="b.id_barang" :label="b.nama_barang" :value="b.id_barang" />
            </el-select>
            <el-date-picker v-model="filters.tanggal_awal" type="date" placeholder="Tanggal awal" value-format="YYYY-MM-DD" @change="handleFilter" />
            <el-date-picker v-model="filters.tanggal_akhir" type="date" placeholder="Tanggal akhir" value-format="YYYY-MM-DD" @change="handleFilter" />
        </div>

        <el-table :data="list" v-loading="loading" stripe style="width: 100%">
            <el-table-column prop="tanggal" label="Tanggal" width="120" />
            <el-table-column label="Barang">
                <template #default="{ row }">{{ row.Barang?.nama_barang }}</template>
            </el-table-column>
            <el-table-column label="Jumlah" width="100">
                <template #default="{ row }">{{ row.jumlah }} {{ row.Barang?.satuan }}</template>
            </el-table-column>
            <el-table-column label="Lokasi">
                <template #default="{ row }">{{ row.Lokasi?.nama_lokasi || "-" }}</template>
            </el-table-column>
            <el-table-column label="Diambil oleh">
                <template #default="{ row }">{{ row.Pengguna?.nama }}</template>
            </el-table-column>
            <el-table-column prop="keperluan" label="Keperluan" />
        </el-table>

        <div class="pagination-row">
            <el-pagination
                background
                layout="prev, pager, next"
                :total="pagination.total_data"
                :page-size="filters.limit"
                :current-page="filters.page"
                @current-change="handlePageChange"
            />
        </div>

        <TransaksiKeluarFormDialog v-model="showForm" :barang-list="barangList" @created="handleCreated" />
    </div>
</template>

<style scoped>
.header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.filter-row { display: flex; gap: 12px; margin-bottom: 16px; }
.pagination-row { display: flex; justify-content: flex-end; margin-top: 16px; }
.header-actions { display: flex; gap: 8px; }
</style>