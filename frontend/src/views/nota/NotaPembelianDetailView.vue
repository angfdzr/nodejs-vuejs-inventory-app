<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getNotaPembelianById } from "@/services/notaPembelianService";
import { getFileUrl } from "@/utils/fileUrl";
import { ElMessage } from "element-plus";

const route = useRoute();
const router = useRouter();
const nota = ref(null);
const loading = ref(true);

const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka || 0);

const fetchData = async () => {
    loading.value = true;
    try {
        const res = await getNotaPembelianById(route.params.id);
        nota.value = res.data.data;
    } catch (error) {
        ElMessage.error("Gagal memuat detail nota");
        router.push("/nota-pembelian");
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);
</script>

<template>
    <div v-loading="loading">
        <div class="header-row">
            <h2>Detail Nota Pembelian</h2>
            <el-button @click="router.push('/nota-pembelian')">Kembali</el-button>
        </div>

        <template v-if="nota">
            <el-card class="info-card">
                <div class="info-grid">
                    <div><span class="label">Tanggal</span><div>{{ nota.tanggal }}</div></div>
                    <div><span class="label">Nomor nota</span><div>{{ nota.nomor_nota || "-" }}</div></div>
                    <div><span class="label">Supplier</span><div>{{ nota.Supplier?.nama_supplier || "-" }}</div></div>
                    <div><span class="label">Dicatat oleh</span><div>{{ nota.Pengguna?.nama }}</div></div>
                    <div><span class="label">Total harga</span><div class="total-text">{{ formatRupiah(nota.total_harga) }}</div></div>
                    <div>
                        <span class="label">Nota</span>
                        <div>
                            <a v-if="nota.file_nota" :href="getFileUrl(nota.file_nota)" target="_blank">Lihat file</a>
                            <span v-else class="text-muted">Tidak ada file</span>
                        </div>
                    </div>
                </div>
                <div v-if="nota.keterangan" class="keterangan">
                    <span class="label">Keterangan</span>
                    <div>{{ nota.keterangan }}</div>
                </div>
            </el-card>

            <h3 class="rincian-title">Rincian barang</h3>
            <div class="table-scroll">
                <el-table :data="nota.rincian" stripe style="width: 100%; min-width: 550px">
                    <el-table-column label="Nama barang">
                        <template #default="{ row }">{{ row.Barang?.nama_barang }}</template>
                    </el-table-column>
                    <el-table-column label="Jumlah" width="100">
                        <template #default="{ row }">{{ row.jumlah }} {{ row.Barang?.satuan }}</template>
                    </el-table-column>
                    <el-table-column label="Harga satuan" width="140">
                        <template #default="{ row }">{{ formatRupiah(row.harga_satuan) }}</template>
                    </el-table-column>
                    <el-table-column label="Subtotal" width="140">
                        <template #default="{ row }">{{ formatRupiah(row.subtotal) }}</template>
                    </el-table-column>
                </el-table>
            </div>
        </template>
    </div>
</template>

<style scoped>
.header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.info-card { margin-bottom: 24px; }
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
.label { font-size: 12px; color: #9ca3af; }
.total-text { font-size: 18px; font-weight: 600; color: #16a34a; }
.keterangan { margin-top: 16px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
.rincian-title { font-size: 16px; font-weight: 500; margin-bottom: 12px; }
.table-scroll { overflow-x: auto; }
.text-muted { color: #9ca3af; }
</style>