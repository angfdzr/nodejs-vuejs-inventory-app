<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getNotaPembelian, deleteNotaPembelian, exportNotaPembelian } from "@/services/notaPembelianService";
import { getSupplier } from "@/services/supplierService";
import { downloadBlob } from "@/utils/downloadBlob";
import { getFileUrl } from "@/utils/fileUrl";
import { ElMessage, ElMessageBox } from "element-plus";

const router = useRouter();
const list = ref([]);
const supplierList = ref([]);
const loading = ref(false);
const exporting = ref(false);

const filters = ref({
    search: "",
    id_supplier: "",
    tanggal_awal: "",
    tanggal_akhir: "",
    page: 1,
    limit: 10
});
const pagination = ref({ total_data: 0 });

const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka || 0);

const fetchSupplier = async () => {
    const res = await getSupplier({ limit: 100 });
    supplierList.value = res.data.data.sort((a, b) => a.nama_supplier.localeCompare(b.nama_supplier, "id"));
};

const fetchData = async () => {
    loading.value = true;
    try {
        const res = await getNotaPembelian(filters.value);
        list.value = res.data.data;
        pagination.value = res.data.pagination;
    } catch (error) {
        ElMessage.error("Gagal memuat data nota pembelian");
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

const handleDelete = (row) => {
    ElMessageBox.confirm(
        `Hapus nota "${row.nomor_nota || "#" + row.id_nota}"? Stok barang terkait akan otomatis dikurangi kembali.`,
        "Konfirmasi",
        { type: "warning" }
    ).then(async () => {
        await deleteNotaPembelian(row.id_nota);
        ElMessage.success("Nota berhasil dihapus");
        fetchData();
    }).catch(() => {});
};

const handleExport = async () => {
    if (!filters.value.tanggal_awal || !filters.value.tanggal_akhir) {
        ElMessage.warning("Pilih rentang tanggal awal dan akhir terlebih dahulu");
        return;
    }
    exporting.value = true;
    try {
        const res = await exportNotaPembelian({
            tanggal_awal: filters.value.tanggal_awal,
            tanggal_akhir: filters.value.tanggal_akhir,
            id_supplier: filters.value.id_supplier
        });
        downloadBlob(res.data, `laporan-pembelian_${filters.value.tanggal_awal}_sd_${filters.value.tanggal_akhir}.csv`);
        ElMessage.success("CSV berhasil diunduh");
    } catch (error) {
        ElMessage.error("Gagal mengunduh CSV");
    } finally {
        exporting.value = false;
    }
};

onMounted(() => {
    fetchSupplier();
    fetchData();
});
</script>

<template>
    <div>
        <div class="header-row">
            <h2>Nota Pembelian</h2>
            <div class="header-actions">
                <el-button :loading="exporting" @click="handleExport">
                    <i class="ti ti-download"></i>&nbsp;Unduh CSV
                </el-button>
                <el-button type="primary" @click="router.push('/nota-pembelian/tambah')">Tambah Nota</el-button>
            </div>
        </div>

        <div class="filter-row">
            <el-input v-model="filters.search" placeholder="Cari nomor nota..." clearable style="width: 200px" @keyup.enter="handleFilter" @clear="handleFilter" />
            <el-select v-model="filters.id_supplier" placeholder="Semua supplier" clearable style="width: 200px" @change="handleFilter">
                <el-option v-for="s in supplierList" :key="s.id_supplier" :label="s.nama_supplier" :value="s.id_supplier" />
            </el-select>
            <el-date-picker v-model="filters.tanggal_awal" type="date" placeholder="Tanggal awal" value-format="YYYY-MM-DD" @change="handleFilter" />
            <el-date-picker v-model="filters.tanggal_akhir" type="date" placeholder="Tanggal akhir" value-format="YYYY-MM-DD" @change="handleFilter" />
            <el-button type="primary" @click="handleFilter">Cari</el-button>
        </div>

        <div class="table-scroll">
            <el-table :data="list" v-loading="loading" stripe style="width: 100%; min-width: 750px">
                <el-table-column prop="tanggal" label="Tanggal" width="110" />
                <el-table-column label="Nomor nota" width="130">
                    <template #default="{ row }">{{ row.nomor_nota || "-" }}</template>
                </el-table-column>
                <el-table-column label="Supplier">
                    <template #default="{ row }">{{ row.Supplier?.nama_supplier || "-" }}</template>
                </el-table-column>
                <el-table-column label="Total harga" width="140">
                    <template #default="{ row }">{{ formatRupiah(row.total_harga) }}</template>
                </el-table-column>
                <el-table-column label="Dicatat oleh">
                    <template #default="{ row }">{{ row.Pengguna?.nama }}</template>
                </el-table-column>
                <el-table-column label="Nota" width="90">
                    <template #default="{ row }">
                        <a v-if="row.file_nota" :href="getFileUrl(row.file_nota)" target="_blank">Lihat</a>
                        <span v-else class="text-muted">-</span>
                    </template>
                </el-table-column>
                <el-table-column label="Aksi" width="170">
                    <template #default="{ row }">
                        <el-button size="small" @click="router.push(`/nota-pembelian/${row.id_nota}`)">Detail</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(row)">Hapus</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <div class="pagination-row">
            <el-pagination background layout="prev, pager, next" :total="pagination.total_data" :page-size="filters.limit" :current-page="filters.page" @current-change="handlePageChange" />
        </div>
    </div>
</template>

<style scoped>
.header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.header-actions { display: flex; gap: 8px; }
.filter-row { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.pagination-row { display: flex; justify-content: flex-end; margin-top: 16px; }
.text-muted { color: #9ca3af; }
</style>