<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getKategoriById, createKategori, updateKategori } from "@/services/kategoriService";
import { ElMessage } from "element-plus";

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const formRef = ref(null);

const form = ref({ nama_kategori: "", keterangan: "" });

const rules = {
    nama_kategori: [{ required: true, message: "Nama kategori wajib diisi", trigger: "blur" }]
};

const fetchData = async () => {
    if (!isEdit.value) return;
    const res = await getKategoriById(route.params.id);
    form.value = {
        nama_kategori: res.data.data.nama_kategori,
        keterangan: res.data.data.keterangan
    };
};

const handleSubmit = async () => {
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) return;

    loading.value = true;
    try {
        if (isEdit.value) {
            await updateKategori(route.params.id, form.value);
            ElMessage.success("Kategori berhasil diperbarui");
        } else {
            await createKategori(form.value);
            ElMessage.success("Kategori berhasil ditambahkan");
        }
        router.push("/kategori");
    } catch (error) {
        ElMessage.error(error.response?.data?.message || "Gagal menyimpan kategori");
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);
</script>

<template>
    <div>
        <h2>{{ isEdit ? "Edit Kategori" : "Tambah Kategori" }}</h2>
        <el-card style="max-width: 480px; margin-top: 16px">
            <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
                <el-form-item label="Nama kategori" prop="nama_kategori">
                    <el-input v-model="form.nama_kategori" placeholder="Misal: Alat Kebersihan" />
                </el-form-item>
                <el-form-item label="Keterangan">
                    <el-input v-model="form.keterangan" type="textarea" :rows="3" />
                </el-form-item>
                <div class="form-actions">
                    <el-button @click="router.push('/kategori')">Batal</el-button>
                    <el-button type="primary" :loading="loading" @click="handleSubmit">Simpan</el-button>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<style scoped>
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
</style>