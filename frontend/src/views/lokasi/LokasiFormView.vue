<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getLokasiById, createLokasi, updateLokasi } from "@/services/lokasiService";
import { ElMessage } from "element-plus";

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const formRef = ref(null);

const form = ref({ nama_lokasi: "", keterangan: "" });

const rules = {
    nama_lokasi: [{ required: true, message: "Nama lokasi wajib diisi", trigger: "blur" }]
};

const fetchData = async () => {
    if (!isEdit.value) return;
    const res = await getLokasiById(route.params.id);
    form.value = {
        nama_lokasi: res.data.data.nama_lokasi,
        keterangan: res.data.data.keterangan
    };
};

const handleSubmit = async () => {
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) return;

    loading.value = true;
    try {
        if (isEdit.value) {
            await updateLokasi(route.params.id, form.value);
            ElMessage.success("Lokasi berhasil diperbarui");
        } else {
            await createLokasi(form.value);
            ElMessage.success("Lokasi berhasil ditambahkan");
        }
        router.push("/lokasi");
    } catch (error) {
        ElMessage.error(error.response?.data?.message || "Gagal menyimpan lokasi");
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);
</script>

<template>
    <div>
        <h2>{{ isEdit ? "Edit Lokasi" : "Tambah Lokasi" }}</h2>
        <el-card style="max-width: 480px; margin-top: 16px">
            <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
                <el-form-item label="Nama lokasi" prop="nama_lokasi">
                    <el-input v-model="form.nama_lokasi" placeholder="Misal: Ruang Admin" />
                </el-form-item>
                <el-form-item label="Keterangan">
                    <el-input v-model="form.keterangan" type="textarea" :rows="3" />
                </el-form-item>
                <div class="form-actions">
                    <el-button @click="router.push('/lokasi')">Batal</el-button>
                    <el-button type="primary" :loading="loading" @click="handleSubmit">Simpan</el-button>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<style scoped>
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
</style>