<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { createNotaPembelian } from "@/services/notaPembelianService";
import { getSupplier } from "@/services/supplierService";
import { getBarang } from "@/services/barangService";
import { ElMessage } from "element-plus";
import { Delete, Plus } from "@element-plus/icons-vue";

const router = useRouter();
const formRef = ref(null);
const loading = ref(false);

const supplierList = ref([]);
const barangList = ref([]);
const fileNota = ref(null);

const form = ref({
    nomor_nota: "",
    tanggal: new Date().toISOString().slice(0, 10),
    id_supplier: "",
    keterangan: ""
});

const items = ref([{ id_barang: "", jumlah: 1, harga_satuan: 0 }]);

const rules = {
    tanggal: [{ required: true, message: "Tanggal wajib diisi", trigger: "change" }]
};

const totalHarga = computed(() =>
    items.value.reduce((sum, i) => sum + (Number(i.jumlah) || 0) * (Number(i.harga_satuan) || 0), 0)
);

const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka || 0);

const addItem = () => items.value.push({ id_barang: "", jumlah: 1, harga_satuan: 0 });
const removeItem = (index) => {
    if (items.value.length === 1) {
        ElMessage.warning("Minimal harus ada 1 barang");
        return;
    }
    items.value.splice(index, 1);
};

const handleFileChange = (file) => {
    fileNota.value = file.raw;
};

const fetchSupplier = async () => {
    const res = await getSupplier({ limit: 100 });
    supplierList.value = res.data.data.sort((a, b) => a.nama_supplier.localeCompare(b.nama_supplier, "id"));
};

const fetchBarang = async () => {
    const res = await getBarang({ limit: 100 });
    barangList.value = res.data.data.sort((a, b) => a.nama_barang.localeCompare(b.nama_barang, "id"));
};

const handleSubmit = async () => {
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) return;

    const itemsValid = items.value.every((i) => i.id_barang && Number(i.jumlah) > 0 && Number(i.harga_satuan) >= 0);
    if (!itemsValid) {
        ElMessage.warning("Pastikan setiap baris barang sudah dipilih dan jumlahnya lebih dari 0");
        return;
    }

    loading.value = true;
    try {
        const formData = new FormData();
        formData.append("nomor_nota", form.value.nomor_nota);
        formData.append("tanggal", form.value.tanggal);
        formData.append("id_supplier", form.value.id_supplier || "");
        formData.append("keterangan", form.value.keterangan);
        formData.append("items", JSON.stringify(items.value));
        if (fileNota.value) formData.append("file_nota", fileNota.value);

        await createNotaPembelian(formData);
        ElMessage.success("Nota pembelian berhasil disimpan");
        router.push("/nota-pembelian");
    } catch (error) {
        ElMessage.error(error.response?.data?.message || "Gagal menyimpan nota pembelian");
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchSupplier();
    fetchBarang();
});
</script>

<template>
    <div>
        <h2>Tambah Nota Pembelian</h2>

        <el-card style="margin-top: 16px">
            <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
                <div class="header-fields">
                    <el-form-item label="Tanggal" prop="tanggal">
                        <el-date-picker v-model="form.tanggal" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
                    </el-form-item>
                    <el-form-item label="Nomor nota (opsional)">
                        <el-input v-model="form.nomor_nota" placeholder="Misal: INV-0231" />
                    </el-form-item>
                    <el-form-item label="Supplier">
                        <el-select v-model="form.id_supplier" placeholder="Pilih supplier (opsional)" clearable style="width: 100%">
                            <el-option v-for="s in supplierList" :key="s.id_supplier" :label="s.nama_supplier" :value="s.id_supplier" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Foto/scan nota (opsional)">
                        <el-upload action="" :auto-upload="false" :limit="1" accept=".jpg,.jpeg,.png,.pdf" @change="handleFileChange">
                            <el-button>Pilih file</el-button>
                            <template #tip>
                                <div class="upload-tip">Format jpg, png, atau pdf. Maksimal 5MB.</div>
                            </template>
                        </el-upload>
                    </el-form-item>
                </div>

                <el-form-item label="Keterangan">
                    <el-input v-model="form.keterangan" type="textarea" :rows="2" />
                </el-form-item>

                <div class="items-header">
                    <h3>Rincian barang</h3>
                    <el-button size="small" @click="addItem"><el-icon><Plus /></el-icon>&nbsp;Tambah baris</el-button>
                </div>

                <div class="table-scroll">
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Barang</th>
                                <th style="width: 100px">Jumlah</th>
                                <th style="width: 150px">Harga satuan</th>
                                <th style="width: 140px">Subtotal</th>
                                <th style="width: 50px"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in items" :key="index">
                                <td>
                                    <el-select v-model="item.id_barang" placeholder="Pilih barang" style="width: 100%" filterable>
                                        <el-option v-for="b in barangList" :key="b.id_barang" :label="b.nama_barang" :value="b.id_barang" />
                                    </el-select>
                                </td>
                                <td><el-input-number v-model="item.jumlah" :min="1" style="width: 100%" /></td>
                                <td><el-input-number v-model="item.harga_satuan" :min="0" :step="500" style="width: 100%" /></td>
                                <td class="subtotal-cell">{{ formatRupiah(item.jumlah * item.harga_satuan) }}</td>
                                <td>
                                    <el-button size="small" type="danger" text @click="removeItem(index)">
                                        <el-icon><Delete /></el-icon>
                                    </el-button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="total-row">
                    <span>Total keseluruhan</span>
                    <strong>{{ formatRupiah(totalHarga) }}</strong>
                </div>

                <div class="form-actions">
                    <el-button @click="router.push('/nota-pembelian')">Batal</el-button>
                    <el-button type="primary" :loading="loading" @click="handleSubmit">Simpan Nota</el-button>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<style scoped>
.header-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0 16px; }
.upload-tip { font-size: 12px; color: #9ca3af; margin-top: 4px; }
.items-header { display: flex; align-items: center; justify-content: space-between; margin: 20px 0 12px; }
.items-header h3 { font-size: 15px; font-weight: 500; margin: 0; }
.table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.items-table { width: 100%; min-width: 600px; border-collapse: collapse; }
.items-table th { text-align: left; font-size: 12px; color: #6b7280; padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
.items-table td { padding: 6px 8px; vertical-align: middle; }
.subtotal-cell { font-size: 14px; font-weight: 500; white-space: nowrap; }
.total-row { display: flex; justify-content: flex-end; gap: 12px; align-items: center; padding: 14px 8px; border-top: 2px solid #e5e7eb; margin-top: 8px; font-size: 15px; }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
</style>