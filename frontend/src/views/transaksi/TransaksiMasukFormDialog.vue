<script setup>
import { ref, watch } from "vue";
import { createTransaksiMasuk } from "@/services/transaksiMasukService";
import { getSupplier } from "@/services/supplierService";
import { ElMessage } from "element-plus";

const props = defineProps({
    modelValue: Boolean,
    barangList: Array
});
const emit = defineEmits(["update:modelValue", "created"]);

const loading = ref(false);
const formRef = ref(null);
const supplierList = ref([]);

const form = ref({
    id_barang: "",
    id_supplier: "",
    tanggal: new Date().toISOString().slice(0, 10),
    jumlah: 1,
    keterangan: ""
});

const rules = {
    id_barang: [{ required: true, message: "Barang wajib dipilih", trigger: "change" }],
    tanggal: [{ required: true, message: "Tanggal wajib diisi", trigger: "change" }],
    jumlah: [{ required: true, message: "Jumlah wajib diisi", trigger: "blur" }]
};

const fetchSupplier = async () => {
    const res = await getSupplier({ limit: 100 });
    supplierList.value = res.data.data.sort((a, b) =>
        a.nama_supplier.localeCompare(b.nama_supplier, "id")
    );
};

watch(() => props.modelValue, (val) => {
    if (val) {
        fetchSupplier();
        form.value = {
            id_barang: "", id_supplier: "",
            tanggal: new Date().toISOString().slice(0, 10),
            jumlah: 1, keterangan: ""
        };
    }
});

const handleClose = () => emit("update:modelValue", false);

const handleSubmit = async () => {
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) return;

    loading.value = true;
    try {
        await createTransaksiMasuk(form.value);
        ElMessage.success("Barang masuk berhasil dicatat");
        emit("created");
    } catch (error) {
        ElMessage.error(error.response?.data?.message || "Gagal mencatat barang masuk");
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <el-dialog :model-value="modelValue" title="Catat Barang Masuk" width="420px" @update:model-value="handleClose">
        <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
            <el-form-item label="Barang" prop="id_barang">
                <el-select v-model="form.id_barang" placeholder="Pilih barang" style="width: 100%">
                    <el-option v-for="b in barangList" :key="b.id_barang" :label="b.nama_barang" :value="b.id_barang" />
                </el-select>
            </el-form-item>
            <el-form-item label="Supplier">
                <el-select v-model="form.id_supplier" placeholder="Pilih supplier (opsional)" clearable style="width: 100%">
                    <el-option v-for="s in supplierList" :key="s.id_supplier" :label="s.nama_supplier" :value="s.id_supplier" />
                </el-select>
            </el-form-item>
            <el-form-item label="Tanggal" prop="tanggal">
                <el-date-picker v-model="form.tanggal" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
            <el-form-item label="Jumlah" prop="jumlah">
                <el-input-number v-model="form.jumlah" :min="1" style="width: 100%" />
            </el-form-item>
            <el-form-item label="Keterangan">
                <el-input v-model="form.keterangan" type="textarea" :rows="2" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="handleClose">Batal</el-button>
            <el-button type="primary" :loading="loading" @click="handleSubmit">Simpan</el-button>
        </template>
    </el-dialog>
</template>