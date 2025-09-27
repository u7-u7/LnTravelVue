<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h1>加入旅牛网</h1>
        <p>注册账号，开启您的旅行之旅</p>
      </div>
      
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            size="large"
            prefix-icon="Message"
          />
        </el-form-item>
        
        <el-form-item prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号"
            size="large"
            prefix-icon="Phone"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="agreeTerms">
            我已阅读并同意
            <el-link type="primary">《服务条款》</el-link>
            和
            <el-link type="primary">《隐私政策》</el-link>
          </el-checkbox>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            :disabled="!agreeTerms"
            @click="handleRegister"
            class="register-button"
          >
            注册
          </el-button>
        </el-form-item>
        
        <div class="login-link">
          已有账号？
          <el-link type="primary" @click="goToLogin">立即登录</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register, checkUsername, checkEmail, checkPhone } from '@/api/user'

export default {
  name: 'RegisterPage',
  setup() {
    const router = useRouter()
    
    const registerFormRef = ref(null)
    const loading = ref(false)
    const agreeTerms = ref(false)
    
    const registerForm = reactive({
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    })
    
    // 自定义验证规则
    const validateUsername = async (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入用户名'))
        return
      }
      if (value.length < 3 || value.length > 20) {
        callback(new Error('用户名长度在 3 到 20 个字符'))
        return
      }
      
      try {
        const response = await checkUsername(value)
        if (response.data) {
          callback(new Error('用户名已存在'))
        } else {
          callback()
        }
      } catch (error) {
        callback()
      }
    }
    
    const validateEmail = async (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入邮箱'))
        return
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        callback(new Error('请输入正确的邮箱格式'))
        return
      }
      
      try {
        const response = await checkEmail(value)
        if (response.data) {
          callback(new Error('邮箱已被注册'))
        } else {
          callback()
        }
      } catch (error) {
        callback()
      }
    }
    
    const validatePhone = async (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入手机号'))
        return
      }
      
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(value)) {
        callback(new Error('请输入正确的手机号格式'))
        return
      }
      
      try {
        const response = await checkPhone(value)
        if (response.data) {
          callback(new Error('手机号已被注册'))
        } else {
          callback()
        }
      } catch (error) {
        callback()
      }
    }
    
    const validateConfirmPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请确认密码'))
        return
      }
      if (value !== registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
        return
      }
      callback()
    }
    
    const registerRules = {
      username: [
        { validator: validateUsername, trigger: 'blur' }
      ],
      email: [
        { validator: validateEmail, trigger: 'blur' }
      ],
      phone: [
        { validator: validatePhone, trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
        { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, message: '密码必须包含大小写字母和数字', trigger: 'blur' }
      ],
      confirmPassword: [
        { validator: validateConfirmPassword, trigger: 'blur' }
      ]
    }
    
    const handleRegister = async () => {
      if (!registerFormRef.value) return
      
      await registerFormRef.value.validate(async (valid) => {
        if (valid) {
          loading.value = true
          try {
            await register({
              username: registerForm.username,
              email: registerForm.email,
              phone: registerForm.phone,
              password: registerForm.password
            })
            
            ElMessage.success('注册成功，请登录')
            router.push('/login')
          } catch (error) {
            ElMessage.error(error.message || '注册失败')
          } finally {
            loading.value = false
          }
        }
      })
    }
    
    const goToLogin = () => {
      router.push('/login')
    }
    
    return {
      registerFormRef,
      registerForm,
      registerRules,
      loading,
      agreeTerms,
      handleRegister,
      goToLogin
    }
  }
}
</script>

<style lang="scss" scoped>
.register-page {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('/register-bg.jpg') center/cover;
    opacity: 0.3;
    z-index: 0;
  }
}

.register-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    color: #333;
    font-size: 28px;
    font-weight: bold;
    margin: 0 0 10px 0;
    background: linear-gradient(45deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    color: #666;
    font-size: 14px;
    margin: 0;
  }
}

.register-form {
  .el-form-item {
    margin-bottom: 20px;
  }
  
  .register-button {
    width: 100%;
    height: 45px;
    font-size: 16px;
    font-weight: bold;
    background: linear-gradient(45deg, #667eea, #764ba2);
    border: none;
    
    &:hover {
      background: linear-gradient(45deg, #5a6fd8, #6a4190);
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

// 响应式设计
@media (max-width: 480px) {
  .register-container {
    width: 90%;
    padding: 30px 20px;
  }
  
  .register-header h1 {
    font-size: 24px;
  }
}
</style>
