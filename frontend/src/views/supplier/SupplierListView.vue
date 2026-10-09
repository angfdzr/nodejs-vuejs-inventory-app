<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getSupplier, deleteSupplier } from "@/services/supplierService";
import { ElMessage, ElMessageBox } from "element-plus";

const router = useRouter();
const list = ref([]);
const loading = ref(false);
const filters = ref({ search: "", page: 1, limit: 10 });
const pagination = ref({ total_data: 0 });

const fetchData = async () => {
    loading.value = true;
    try {
        const res = await getSupplier(filters.value);
        list.value = res.data.data;
        pagination.value = res.data.pagination;
    } catch (error) {
        ElMessage.error("Gagal memuat data supplier");
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    filters.value.page = 1;
    fetchData();
};

const handlePageChange = (page) => {
    filters.value.page = page;
    fetchData();
};

const handleDelete = (row) => {
    ElMessageBox.confirm(`Hapus supplier "${row.nama_supplier}"?`, "Konfirmasi", { type: "warning" })
        .then(async () => {
            await deleteSupplier(row.id_supplier);
            ElMessage.success("Supplier berhasil dihapus");
            fetchData();
        }).catch(() => {});
};

onMounted(fetchData);
</script>

<template>
    <div>
        <div class="header-row">
            <h2>Data Supplier</h2>
            <el-button type="primary" @click="router.push('/supplier/tambah')">Tambah Supplier</el-button>
        </div>

        <div class="filter-row">
            <el-input
                v-model="filters.search"
                placeholder="Cari nama supplier..."
                clearable
                style="width: 240px"
                @keyup.enter="handleSearch"
                @clear="handleSearch"
            />
            <el-button type="primary" @click="handleSearch">Cari</el-button>
        </div>

        <el-table :data="list" v-loading="loading" stripe style="width: 100%">
            <el-table-column prop="nama_supplier" label="Nama supplier" />
            <el-table-column prop="kontak" label="Kontak" />
            <el-table-column prop="alamat" label="Alamat" />
            <el-table-column label="Aksi" width="160">
                <template #default="{ row }">
                    <el-button size="small" @click="router.push(`/supplier/edit/${row.id_supplier}`)">Edit</el-button>
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
.header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.filter-row { display: flex; gap: 12px; margin-bottom: 16px; }
.pagination-row { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>