import { AUTH_USER_DATA_KEY } from '@/lib/constants/keys'
import type { IRecord } from '@/lib/types/record'

class UserDataStorage {
  setUserData(userData: IRecord) {
    localStorage.setItem(AUTH_USER_DATA_KEY, JSON.stringify(userData))
  }

  getUserData(): IRecord | null {
    const userData = localStorage.getItem(AUTH_USER_DATA_KEY)
    if (!userData) {
      return null
    }
    return JSON.parse(userData)
  }

  clearUserData() {
    localStorage.removeItem(AUTH_USER_DATA_KEY)
  }
}

export default new UserDataStorage()
