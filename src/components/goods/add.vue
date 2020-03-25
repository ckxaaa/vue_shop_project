<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 添加商品卡片视图 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert
      :closable="false"
      title="添加商品信息"
      type="info"
      show-icon
      >
      </el-alert>
      <!-- 进度条 -->
      <el-steps :active="activeNum - 0" align-center finish-status="success">
        <el-step title="基本信息" ></el-step>
        <el-step title="商品参数" ></el-step>
        <el-step title="商品属性" ></el-step>
        <el-step title="商品图片" ></el-step>
        <el-step title="商品内容" ></el-step>
        <el-step title="完成" ></el-step>
      </el-steps>
      <!-- tabs栏区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-position="top" label-width="100px">
        <el-tabs v-model="activeNum" :tab-position="'left'" :before-leave="aciveLeave" @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
              v-model="addForm.goods_cat"
              :options="cateList"
              :props="cateListProps"
              @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
            v-for="(item) in manyTabDate" :key="item.attr_id"
            :label="item.attr_name">
            <el-checkbox-group v-model="item.attr_vals">
              <el-checkbox :label="vals" v-for="(vals, index) in item.attr_vals" :key="index" border></el-checkbox>
            </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTabDate" :label="item.attr_name" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action是我们上传后台的API的地址 -->
            <!-- on-preview预览图片事件 -->
            <el-upload
            :action="uploadURL"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            list-type="picture"
            :headers='myHeaders'
            :on-success="handleSuccess">
            <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog
    title="图片预览"
    :visible.sync="previewVisible"
    width="50%">
    <img :src="previewURL" class="previewImg" @click="add">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data () {
    return {
      activeNum: '0',
      // 添加表单的对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        // 商品分类选择
        goods_cat: [],
        // 图片上传临时路径
        pics: [],
        // 商品的详情介绍
        goods_introduce: '',
        attrs: []
      },
      // 添加表单的验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 分类列表
      cateList: [],
      cateListProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 动态参数商品分类数据
      manyTabDate: [],
      // 静态属性商品分类数据
      onlyTabDate: [],
      // 图片上传的路径
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 上传图片的headers请求头对象
      myHeaders: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览的url
      previewURL: '',
      // 控制对话框显示隐藏
      previewVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取分类失败')
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 判断级联选择器选择的是否是三级分类
    handleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        return true
      }
    },
    // 控制切换标签页
    aciveLeave (aciveName, aciveOldName) {
      if (aciveOldName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    async tabClick () {
      // 获取商品分类
      if (this.activeNum === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品参数失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length !== 0 ? item.attr_vals.split(' ') : []
        })
        this.manyTabDate = res.data
        console.log(res.data)
      } else if (this.activeNum === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) return this.$message.error('获取商品属性失败')
        this.onlyTabDate = res.data
        console.log(res.data)
      }
    },
    // 预览图片事件
    handlePreview (file) {
      this.previewURL = file.response.data.url
      this.previewVisible = true
    },
    // 删除图片事件
    handleRemove (file) {
      const filePath = file.response.data.tmp_path
      const index = this.addForm.pics.findIndex(x => x.pics === filePath)
      this.addForm.pics.splice(index, 1)
      console.log(this.addForm)
    },
    // 图片上传成功事件
    handleSuccess (response) {
      const pictureUrl = { pics: response.data.tmp_path }
      this.addForm.pics.push(pictureUrl)
      console.log(this.addForm)
    },
    // 添加商品事件
    async add () {
      // 进行表单预验证
      this.$refs.addFormRef.validate(valid => {
        if (!valid) return this.$message.error('表单验证未通过')
      })
      // 提交表单操作
      // 使用lodash进行深拷贝
      const form = _.cloneDeep(this.addForm)
      form.goods_cat = form.goods_cat.join(',')
      // 处理动态参数
      this.manyTabDate.forEach((item) => {
        const attrInfo = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join(' ')
        }
        this.addForm.attrs.push(attrInfo)
      })
      // 处理静态属性
      this.onlyTabDate.forEach((item) => {
        const attrInfo = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals
        }
        this.addForm.attrs.push(attrInfo)
      })
      form.attrs = this.addForm.attrs
      const { data: res } = await this.$http.post('goods', form)
      console.log(res)
      if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
      this.$message.success('添加商品成功')
      this.$router.push('/goods')
    }
  },
  computed: {
    // 检查是否选中的时三级分类
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 8px 0 0 !important
}
.previewImg {
  width: 100%
}
.addBtn {
  margin: 10px 0
}
</style>
