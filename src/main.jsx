import {GM_getValue, GM_setValue} from '$'
import * as VM from '@violentmonkey/dom'
import './style.scss'

const init = () => {
  const map = document.querySelector('.mhy-game-gis')?.__vue__?.map
  const markerLayers = Object.values(map?._layers ?? {}).filter(layer => layer._drawMarker)

  if (!map || !markerLayers) {
    return
  }

  const insertMarkerStyleTogglePanel = () => {
    const className = 'wegfan__chest-marker-style-toggle'
    if (document.querySelector(`.${className}`)) {
      return
    }

    const panelElement = VM.m(
        <div className="wegfan__chest-marker-style-toggle">
          <div className="chest-marker-style-option">
            <span>解谜宝箱显示样式</span>
            <div className="button-container">
              <div className="button" data-chest-marker-style-index="1">品质</div>
              <div className="button" data-chest-marker-style-index="2">获取方式</div>
            </div>
          </div>
        </div>,
    )

    const chestFilterPanelContentElement = document.querySelector('[id="13"]>div.filter-panel__labels-content')
    if (!chestFilterPanelContentElement) {
      return
    }
    chestFilterPanelContentElement.parentElement.insertBefore(panelElement, chestFilterPanelContentElement)

    const buttons = panelElement.querySelectorAll('.chest-marker-style-option .button')
    const toggleMarkerStyle = event => {
      event.preventDefault()

      buttons.forEach(button => button.classList.remove('selected'))
      event.target.classList.add('selected')

      GM_setValue('markerStyle', event.target.getAttribute('data-chest-marker-style-index'))

      // 强制重新渲染
      markerLayers.forEach(layer => {
        layer._latlngMarkers.dirty = 1
        layer._latlngMarkers.total = 1

        layer.redraw()
      })
    }
    buttons.forEach(button => {
      if (button.getAttribute('data-chest-marker-style-index') === GM_getValue('markerStyle', '1')) {
        button.classList.add('selected')
      }
      button.addEventListener('click', toggleMarkerStyle)
      button.addEventListener('touchend', toggleMarkerStyle)
    })
  }

  const hookMapDrawMarker = layer => {
    if (layer._wegfan_toggleChestMarkerStyleHooked) {
      return
    }
    layer._drawMarker = function (t, e) {
      let n = this
      this._imageLookup || (this._imageLookup = {}),
      e || (e = n._map.latLngToContainerPoint(t.getLatLng()))
      let iconUrl = t.options.icon.options.iconUrl

      // ==================================================
      const markerStyle = GM_getValue('markerStyle', '1')
      if (markerStyle === '2') {
        // 宝箱获取方式以json字符串的形式存在扩展属性里 {ext_attrs: "{\"3\":7}"}
        let extAttrs = t?.attrs?.marker?.ext_attrs
        if (extAttrs) {
          let chestSource = JSON.parse(extAttrs)?.['3']
          // 如果来源没有对应的图标就还是显示品质，例如直接获取的宝箱来源是"62"
          let sourceIconUrl = t?.attrs?.config?.group?.ext_attr_list?.[0]?.children?.[chestSource]?.icon
          if (sourceIconUrl) {
            iconUrl = sourceIconUrl
          }
        }
      }

      // 记录缓存图片对应的显示样式，不一致则清空强制重新读取
      if (t.canvas_img && t.previousChestMarkerStyle !== markerStyle) {
        t.canvas_img = null
      }
      t.previousChestMarkerStyle = markerStyle
      // ==================================================

      if (t.canvas_img) {
        n._drawImage(t, e)
      } else if (n._imageLookup[iconUrl]) {
        t.canvas_img = n._imageLookup[iconUrl][0],
            !1 === n._imageLookup[iconUrl][1] ? n._imageLookup[iconUrl][2].push([t,
              e]) : n._drawImage(t, e)
      } else {
        let r = new Image
        r.crossOrigin = 'Anonymous',
            r.src = iconUrl,
            t.canvas_img = r,
            n._imageLookup[iconUrl] = [
              r,
              !1,
              [
                [t,
                  e],
              ],
            ],
            r.onload = function () {
              n._imageLookup[iconUrl][1] = !0,
                  n._imageLookup[iconUrl][2].forEach((function (t) {
                    n._drawImage(t[0], t[1])
                  }))
            }
      }
    }
    layer._wegfan_toggleChestMarkerStyleHooked = true
  }

  insertMarkerStyleTogglePanel()
  markerLayers.forEach(layer => {
    hookMapDrawMarker(layer)
  })
}

init()
setInterval(init, 500)
