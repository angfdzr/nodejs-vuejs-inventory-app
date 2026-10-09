<script setup>
import { ref, watch } from "vue";
import { createTransaksiKeluar } from "@/services/transaksiKeluarService";
import { getLokasi } from "@/services/lokasiService";
import { ElMessage } from "element-plus";

const props = defineProps({
    modelValue: Boolean,
    barangList: Array
});
const emit = defineEmits(["update:modelValue", "created"]);

const loading = ref(false);
const formRef = ref(null);
const lokasiList = ref([]);

const form = ref({
    id_barang: "",
    id_lokasi: "",
    tanggal: new Date().toISOString().slice(0, 10),
    jumlah: 1,
    keperluan: ""
});

const rules = {
    id_barang: [{ required: true, message: "Barang wajib dipilih", trigger: "change" }],
    tanggal: [{ required: true, message: "Tanggal wajib diisi", trigger: "change" }],
    jumlah: [{ required: true, message: "Jumlah wajib diisi", trigger: "blur" }]
};

const fetchLokasi = async () => {
    const res = await getLokasi({ limit: 100 });
    lokasiList.value = res.data.data.sort((a, b) =>
        a.nama_lokasi.localeCompare(b.nama_lokasi, "id")
    );
};

watch(() => props.modelValue, (val) => {
    if (val) {
        fetchLokasi();
        form.value = {
            id_barang: "", id_lokasi: "",
            tanggal: new Date().toISOString().slice(0, 10),
            jumlah: 1, keperluan: ""
        };
    }
});

const handleClose = () => emit("update:modelValue", false);

const handleSubmit = async () => {
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) return;

    loading.value = true;
    try {
        await createTransaksiKeluar(form.value);
        ElMessage.success("Barang keluar berhasil dicatat");
        emit("created");
    } catch (error) {
        ElMessage.error(error.response?.data?.message || "Gagal mencatat barang keluar");
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <el-dialog :model-value="modelValue" title="Catat Barang Keluar" width="420px" @update:model-value="handleClose">
        <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
            <el-form-item label="Barang" prop="id_barang">
                <el-select v-model="form.id_barang" placeholder="Pilih barang" style="width: 100%">
                    <el-option v-for="b in barangList" :key="b.id_barang" :label="b.nama_barang" :value="b.id_barang" />
                </el-select>
            </el-form-item>
            <el-form-item label="Lokasi tujuan">
                <el-select v-model="form.id_lokasi" placeholder="Pilih lokasi (opsional)" clearable style="width: 100%">
                    <el-option v-for="l in lokasiList" :key="l.id_lokasi" :label="l.nama_lokasi" :value="l.id_lokasi" />
                </el-select>
            </el-form-item>
            <el-form-item label="Tanggal" prop="tanggal">
                <el-date-picker v-model="form.tanggal" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
            <el-form-item label="Jumlah" prop="jumlah">
                <el-input-number v-model="form.jumlah" :min="1" style="width: 100%" />
            </el-form-item>
            <el-form-item label="Keperluan">
                <el-input v-model="form.keperluan" type="textarea" :rows="2" placeholder="Misal: dipakai membersihkan ruang rapat" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="handleClose">Batal</el-button>
            <el-button type="primary" :loading="loading" @click="handleSubmit">Simpan</el-button>
        </template>
    </el-dialog>
</template>