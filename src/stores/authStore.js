import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { doctolApi, tokenStorage } from '@/services/doctolApi'
import { apiData } from '@/services/apiMappers'

const localPhone = (phone) => String(phone ?? '').replace(/\D/g, '').replace(/^0/, '')

export const useAuthStore = defineStore('auth', () => {
  const customer = ref(null)
  const loading = ref(false)
  const error = ref('')
  const pendingPhone = ref('')
  const expiresIn = ref(0)

  const isAuthenticated = computed(() => Boolean(tokenStorage.get()))

  async function registerCustomer({ name, phone, email = '', deviceName = 'doctol-web' }) {
    loading.value = true
    error.value = ''
    try {
      const normalizedPhone = localPhone(phone)
      const response = await doctolApi.register({
        name: String(name).trim(),
        dial_code: '+966',
        phone: normalizedPhone,
        ...(email ? { email } : {}),
        device_name: deviceName,
      })
      const data = apiData.unwrap(response, {})
      if (!tokenStorage.get()) {
        throw new Error('تم تسجيل العميل لكن السيرفر لم يرجع access_token.')
      }
      pendingPhone.value = normalizedPhone
      customer.value = data.customer ?? data.user ?? data.profile ?? {
        name: String(name).trim(),
        phone: normalizedPhone,
        email,
      }
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function requestOtp({ name, phone, email = '' }) {
    loading.value = true
    error.value = ''
    try {
      const normalizedPhone = localPhone(phone)
      const response = await doctolApi.requestOtp({
        name,
        dial_code: '+966',
        phone: normalizedPhone,
        ...(email ? { email } : {}),
      })
      const data = apiData.unwrap(response, {})
      pendingPhone.value = normalizedPhone
      expiresIn.value = Number(data.expires_in_seconds ?? 600)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function verifyOtp({ code, deviceName = 'doctol-web' }) {
    loading.value = true
    error.value = ''
    try {
      const response = await doctolApi.verifyOtp({
        dial_code: '+966',
        phone: pendingPhone.value,
        code: String(code).trim(),
        device_name: deviceName,
      })
      const data = apiData.unwrap(response, {})
      customer.value = data.customer ?? data.user ?? null
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function hydrate() {
    if (!isAuthenticated.value) return null
    try {
      const data = apiData.unwrap(await doctolApi.account(), {})
      customer.value = data.customer ?? data.user ?? data
      return customer.value
    } catch {
      tokenStorage.clear()
      customer.value = null
      return null
    }
  }

  function logout() {
    doctolApi.logout()
    customer.value = null
  }

  return {
    customer,
    loading,
    error,
    pendingPhone,
    expiresIn,
    isAuthenticated,
    registerCustomer,
    requestOtp,
    verifyOtp,
    hydrate,
    logout,
  }
})
