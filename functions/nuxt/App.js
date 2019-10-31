import Vue from 'vue'
import NuxtLoading from './components/nuxt-loading.vue'

import '../node_modules/buefy/dist/buefy.css'

import '../app/assets/css/buefy.scss'

import '../app/assets/css/transition.scss'

import _6f6c098b from '../app/layouts/default.vue'

const layouts = { "_default": _6f6c098b }

export default {
  head: {"htmlAttrs":{"prefix":"og: http:\u002F\u002Fogp.me\u002Fns# fb: http:\u002F\u002Fogp.me\u002Fns\u002F fb#"},"meta":[{"charset":"utf-8"},{"name":"viewport","content":"width=device-width, initial-scale=1"},{"name":"keywords","content":"MemoryLovers,めもらば"},{"name":"author","content":"&copy; 2019"},{"name":"copyright","content":"&copy; 2019"},{"name":"format-detection","content":"telephone=no,email=no,address=no"},{"name":"theme-color","content":"#FFFFFF"},{"name":"msapplication-config","content":"\u002Fbrowserconfig.xml"},{"name":"msapplication-TileColor","content":"#FFFFFF"},{"name":"msapplication-TileImage","content":"\u002Fmstile-144×144.png"},{"name":"twitter:card","content":"summary_large_image"},{"name":"twitter:site","content":"@MemoryLoverz"},{"name":"twitter:creator","content":"@MemoryLoverz"}],"link":[{"rel":"icon","type":"image\u002Fx-icon","href":"\u002Ffavicon.ico"},{"rel":"shortcut icon","href":"\u002Ffavicon.ico"},{"rel":"apple-touch-icon","sizes":"180x180","href":"\u002Fapple-touch-icon-180x180.png"},{"rel":"mask-icon","href":"\u002Fsafari-icon.svg","color":"#FFFFFF"},{"rel":"icon","type":"image\u002Fpng","sizes":"192×192","href":"\u002Fandroid-chrome-192x192.png"},{"rel":"manifest","href":"\u002Fmanifest.json"},{"rel":"stylesheet","href":"https:\u002F\u002Ffonts.googleapis.com\u002Fcss?family=Roboto:300,400,500,700"},{"rel":"stylesheet","type":"text\u002Fcss","href":"\u002F\u002Fcdn.materialdesignicons.com\u002F2.4.85\u002Fcss\u002Fmaterialdesignicons.min.css"}],"style":[],"script":[]},

  render(h, props) {
    const loadingEl = h('NuxtLoading', { ref: 'loading' })
    const layoutEl = h(this.layout || 'nuxt')
    const templateEl = h('div', {
      domProps: {
        id: '__layout'
      },
      key: this.layoutName
    }, [ layoutEl ])

    const transitionEl = h('transition', {
      props: {
        name: 'layout',
        mode: 'out-in'
      },
      on: {
        beforeEnter(el) {
          // Ensure to trigger scroll event after calling scrollBehavior
          window.$nuxt.$nextTick(() => {
            window.$nuxt.$emit('triggerScroll')
          })
        }
      }
    }, [ templateEl ])

    return h('div', {
      domProps: {
        id: '__nuxt'
      }
    }, [
      loadingEl,
      transitionEl
    ])
  },
  data: () => ({
    isOnline: true,
    layout: null,
    layoutName: ''
  }),
  beforeCreate() {
    Vue.util.defineReactive(this, 'nuxt', this.$options.nuxt)
  },
  created() {
    // Add this.$nuxt in child instances
    Vue.prototype.$nuxt = this
    // add to window so we can listen when ready
    if (process.client) {
      window.$nuxt = this
      this.refreshOnlineStatus()
      // Setup the listeners
      window.addEventListener('online', this.refreshOnlineStatus)
      window.addEventListener('offline', this.refreshOnlineStatus)
    }
    // Add $nuxt.error()
    this.error = this.nuxt.error
  },

  mounted() {
    this.$loading = this.$refs.loading
  },
  watch: {
    'nuxt.err': 'errorChanged'
  },

  computed: {
    isOffline() {
      return !this.isOnline
    }
  },
  methods: {
    refreshOnlineStatus() {
      if (process.client) {
        if (typeof window.navigator.onLine === 'undefined') {
          // If the browser doesn't support connection status reports
          // assume that we are online because most apps' only react
          // when they now that the connection has been interrupted
          this.isOnline = true
        } else {
          this.isOnline = window.navigator.onLine
        }
      }
    },

    errorChanged() {
      if (this.nuxt.err && this.$loading) {
        if (this.$loading.fail) this.$loading.fail()
        if (this.$loading.finish) this.$loading.finish()
      }
    },

    setLayout(layout) {
      if (!layout || !layouts['_' + layout]) {
        layout = 'default'
      }
      this.layoutName = layout
      this.layout = layouts['_' + layout]
      return this.layout
    },
    loadLayout(layout) {
      if (!layout || !layouts['_' + layout]) {
        layout = 'default'
      }
      return Promise.resolve(layouts['_' + layout])
    }
  },
  components: {
    NuxtLoading
  }
}
