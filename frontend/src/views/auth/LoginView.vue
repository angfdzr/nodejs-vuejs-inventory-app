<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { ElMessage } from "element-plus";

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
    email: "",
    password: ""
});

const loading = ref(false);

const handleSubmit = async () => {
    if (!form.value.email || !form.value.password) {
        ElMessage.warning("Email dan password wajib diisi");
        return;
    }

    loading.value = true;
    try {
        await authStore.login(form.value);
        ElMessage.success("Login berhasil");
        router.push("/");
    } catch (error) {
        ElMessage.error(error.response?.data?.message || "Login gagal");
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="login-container">
        <el-card class="login-card">
            <h2>Login</h2>
            <p class="subtitle">Sistem Inventaris VTS Merak</p>

            <el-form :model="form" label-position="top" @submit.prevent="handleSubmit">
                <el-form-item label="Email">
                    <el-input v-model="form.email" placeholder="Masukkan email" />
                </el-form-item>
                <el-form-item label="Password">
                    <el-input
                        v-model="form.password"
                        type="password"
                        placeholder="Masukkan password"
                        show-password
                        @keyup.enter="handleSubmit"
                    />
                </el-form-item>
                <el-button type="primary" :loading="loading" @click="handleSubmit" style="width: 100%">
                    Masuk
                </el-button>
            </el-form>
        </el-card>
    </div>
</template>

<style scoped>
.login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #f3f4f6;
}

.login-card {
    width: 380px;
    padding: 12px;
}

.subtitle {
    color: #6b7280;
    margin-bottom: 20px;
}
</style>