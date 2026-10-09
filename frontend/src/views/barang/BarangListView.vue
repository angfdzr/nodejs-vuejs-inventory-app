<script setup>
import { useRouter } from "vue-router";
const router = useRouter();
import { ref, onMounted, watch } from "vue";
import { getBarang, deleteBarang } from "@/services/barangService";
import { getKategori } from "@/services/kategoriService";
import { ElMessage, ElMessageBox } from "element-plus";

const barangList = ref([]);
const kategoriList = ref([]);
const loading = ref(false);

const filters = ref({
    search: "",
    id_kategori: "",
    jenis_barang: "",
    page: 1,
    limit: 10
});

const pagination = ref({
    total_data: 0,
    total_page: 0
});

const fetchBarang = async () => {
    loading.value = true;
    try {
        const res = await getBarang(filters.value);
        barangList.value = res.data.data;
        pagination.value = res.data.pagination;
    } catch (error) {
        ElMessage.error("Gagal memuat data barang");
    } finally {
        loading.value = false;
    }
};

const fetchKategori = async () => {
    const res = await getKategori({ limit: 100 });
    kategoriList.value = res.data.data;
};

const handleSearch = () => {
    filters.value.page = 1;
    fetchBarang();
};

const handlePageChange = (page) => {
    filters.value.page = page;
    fetchBarang();
};

const handleDelete = (row) => {
    ElMessageBox.confirm(
        `Hapus barang "${row.nama_barang}"?`,
        "Konfirmasi",
        { type: "warning" }
    ).then(async () => {
        await deleteBarang(row.id_barang);
        ElMessage.success("Barang berhasil dihapus");
        fetchBarang();
    }).catch(() => {});
};

const jenisLabel = (jenis) => {
    return jenis === "habis_pakai" ? "Habis pakai" : "Tidak habis pakai";
};

const stokTagType = (row) => {
    return row.stok_saat_ini <= row.stok_minimum ? "danger" : "success";
};

onMounted(() => {
    fetchKategori();
    fetchBarang();
});

watch(() => [filters.value.id_kategori, filters.value.jenis_barang], () => {
    filters.value.page = 1;
    fetchBarang();
});
</script>

<template>
    <div>
        <div class="header-row">
            <h2>Data Barang</h2>
            <el-button type="primary" @click="router.push('/barang/tambah')">Tambah Barang</el-button>
        </div>

        <div class="filter-row">
            <el-input
                v-model="filters.search"
                placeholder="Cari nama barang..."
                clearable
                style="width: 240px"
                @keyup.enter="handleSearch"
                @clear="handleSearch"
            />
            <el-select v-model="filters.id_kategori" placeholder="Semua kategori" clearable style="width: 200px">
                <el-option
                    v-for="kat in kategoriList"
                    :key="kat.id_kategori"
                    :label="kat.nama_kategori"
                    :value="kat.id_kategori"
                />
            </el-select>
            <el-select v-model="filters.jenis_barang" placeholder="Semua jenis" clearable style="width: 180px">
                <el-option label="Habis pakai" value="habis_pakai" />
                <el-option label="Tidak habis pakai" value="tidak_habis_pakai" />
            </el-select>
            <el-button type="primary" @click="handleSearch">Cari</el-button>
        </div>

        <el-table :data="barangList" v-loading="loading" stripe style="width: 100%">
            <el-table-column prop="nama_barang" label="Nama barang" />
            <el-table-column label="Kategori">
                <template #default="{ row }">{{ row.Kategori?.nama_kategori || "-" }}</template>
            </el-table-column>
            <el-table-column label="Jenis">
                <template #default="{ row }">{{ jenisLabel(row.jenis_barang) }}</template>
            </el-table-column>
            <el-table-column prop="satuan" label="Satuan" width="100" />
            <el-table-column label="Stok / Permintaan" width="140">
                <template #default="{ row }">
                    <el-tag :type="stokTagType(row)">
                        {{ row.stok_saat_ini }} / min {{ row.stok_minimum }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="Aksi" width="160">
                <template #default="{ row }">
                    <el-button size="small" @click="router.push(`/barang/edit/${row.id_barang}`)">Edit</el-button>
                    <el-button size="small" type="danger" @click="handleDelete(row)">Hapus</el-button>
                </template>
            </el-table-column>
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
    </div>
</template>

<style scoped>
.header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.filter-row {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
}

.pagination-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
}
</style>