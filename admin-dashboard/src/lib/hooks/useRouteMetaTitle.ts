import { get } from 'lodash-es'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default function useRouteMetaTitle() {
  const route = useRoute()
  console.log(route);
  
  const title = computed(() => get(route.meta, ['title', 'text']))
  return { routeTitle: title }
}
