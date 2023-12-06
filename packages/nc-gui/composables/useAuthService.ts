import AuthService from '@/services/auth-service'

export const useServices = () => {
  return {
    $auth: new AuthService(),
  }
}