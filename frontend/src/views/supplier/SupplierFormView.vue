<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getSupplierById, createSupplier, updateSupplier } from "@/services/supplierService";
import { ElMessage } from "element-plus";

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const formRef = ref(null);

const form = ref({ nama_supplier: "", kontak: "", alamat: "" });

const rules = {
    nama_supplier: [{ required: true, message: "Nama supplier wajib diisi", trigger: "blur" }]
};

const fetchData = async () => {
    if (!isEdit.value) return;
    const res = await getSupplierById(route.params.id);
    form.value = {
        nama_supplier: res.data.data.nama_supplier,
        kontak: res.data.data.kontak,
        alamat: res.data.data.alamat
    };
};

const handleSubmit = async () => {
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) return;

    loading.value = true;
    try {
        if (isEdit.value) {
            await updateSupplier(route.params.id, form.value);
            ElMessage.success("Supplier berhasil diperbarui");
        } else {
            await createSupplier(form.value);
            ElMessage.success("Supplier berhasil ditambahkan");
        }
        router.push("/supplier");
    } catch (error) {
        ElMessage.error(error.response?.data?.message || "Gagal menyimpan supplier");
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);
</script>

<template>
    <div>
        <h2>{{ isEdit ? "Edit Supplier" : "Tambah Supplier" }}</h2>
        <el-card style="max-width: 480px; margin-top: 16px">
            <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
                <el-form-item label="Nama supplier" prop="nama_supplier">
                    <el-input v-model="form.nama_supplier" placeholder="Misal: Toko Sumber Jaya" />
                </el-form-item>
                <el-form-item label="Kontak">
                    <el-input v-model="form.kontak" placeholder="No. HP / telepon" />
                </el-form-item>
                <el-form-item label="Alamat">
                    <el-input v-model="form.alamat" type="textarea" :rows="3" />
                </el-form-item>
                <div class="form-actions">
                    <el-button @click="router.push('/supplier')">Batal</el-button>
                    <el-button type="primary" :loading="loading" @click="handleSubmit">Simpan</el-button>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<style scoped>
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
</style>