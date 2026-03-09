// 地址编辑页
import { addAddress, updateAddress, getAddressDetail } from '../../api/address'

Page({
  data: {
    id: null,
    formData: {
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false
    },
    region: ['请选择', '请选择', '请选择']
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadAddressDetail(options.id)
    }
  },

  // 加载地址详情
  async loadAddressDetail(id) {
    try {
      const res = await getAddressDetail(id)
      if (res.code === 200) {
        const address = res.data
        const region = [
          address.province || '请选择',
          address.city || '请选择',
          address.district || '请选择'
        ]
        this.setData({
          formData: {
            name: address.name || '',
            phone: address.phone || '',
            province: address.province || '',
            city: address.city || '',
            district: address.district || '',
            detail: address.detail || '',
            isDefault: address.isDefault === 1
          },
          region
        })
      }
    } catch (error) {
      console.error('加载地址详情失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 输入框变化
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    })
  },

  // 地区选择变化
  onRegionChange(e) {
    const region = e.detail.value
    this.setData({
      region,
      'formData.province': region[0] || '',
      'formData.city': region[1] || '',
      'formData.district': region[2] || ''
    })
  },

  // Switch 变化
  onSwitchChange(e) {
    this.setData({
      'formData.isDefault': e.detail.value
    })
  },

  // 提交表单
  async submitForm() {
    const { formData, id } = this.data
    
    // 验证必填项
    if (!formData.name) {
      wx.showToast({ title: '请填写收货人', icon: 'none' })
      return
    }
    if (!formData.phone) {
      wx.showToast({ title: '请填写手机号码', icon: 'none' })
      return
    }
    if (!/^[1][3-9][0-9]{9}$/.test(formData.phone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' })
      return
    }
    if (!formData.province || !formData.city) {
      wx.showToast({ title: '请选择所在地区', icon: 'none' })
      return
    }
    if (!formData.detail) {
      wx.showToast({ title: '请填写详细地址', icon: 'none' })
      return
    }
    
    try {
      let res
      if (id) {
        // 更新地址
        res = await updateAddress(id, formData)
      } else {
        // 添加地址
        res = await addAddress(formData)
      }
      
      if (res.code === 200) {
        wx.showToast({
          title: id ? '修改成功' : '添加成功',
          icon: 'success'
        })
        
        // 返回上一页
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        wx.showToast({
          title: res.message || '保存失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('保存地址失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  }
})
