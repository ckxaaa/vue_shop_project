<template>
<!-- 面包屑导航 -->
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只允许第三级分类设置相关参数" show-icon :closable="false" type="warning"></el-alert>
      <!-- 选择商品分类 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
          v-model="cateKeys"
          :options="cateList"
          :props="cateKeysProps"
          @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态属性" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTabData" border stripe>
            <!-- 扩展行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="item.cat_id" closable @close="handleClose(index,scope.row)">{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
                >
              </el-input>
              <!-- 添加的按钮 -->
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="editParams(scope.row)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="delectParams(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <!-- 静态属性表格 -->
           <el-table :data="onlyTabData" border stripe>
            <!-- 扩展行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="item.cat_id" closable @close="handleClose(index,scope.row)">{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
                >
              </el-input>
              <!-- 添加的按钮 -->
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="editParams(scope.row)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog
    :title="'添加' +  titleText"
    :visible.sync="addDialogVisible"
    width="50%"
    @close="addDialogClose">
      <el-form ref="addParamsRef" :model="addParamsFrom" :rules="addParamsFromRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addParamsFrom.attr_name" ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类的对话框 -->
    <el-dialog
    :title="'编辑' +  titleText"
    :visible.sync="editDialogVisible"
    width="50%">
      <el-form ref="editParamsRef" :model="editParamsFrom" :rules="editParamsFromRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editParamsFrom.attr_name" ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editSubParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类
      cateList: [],
      cateKeys: [],
      cateKeysProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 被激活的页签
      activeName: 'many',
      // 动态参数数据
      manyTabData: [],
      // 静态参数数据
      onlyTabData: [],
      // 控制对话框的显示
      addDialogVisible: false,
      // 添加表单绑定的数据
      addParamsFrom: {
        attr_name: ''
      },
      addParamsFromRules: {
        attr_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editParamsFrom: {
        attrId: '',
        attr_name: '',
        attr_sel: ''
      },
      editParamsFromRules: {
        attr_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 控制文本和按钮的布尔值
      inputVisible: false,
      inputValue: ''
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return
      this.cateList = res.data
    },
    handleChange () {
      // 选择的是三级菜单
      if (this.cateKeys.length !== 3) {
        this.cateKeys = []
        this.manyTabData = []
        this.onlyTabData = []
        return true
      }
      this.getParamsData()
    },
    // tab点击事件函数
    handleTabClick () {
      this.getParamsData()
      console.log(this.activeName)
    },
    // 发起请求，获取动态或静态的参数
    async getParamsData () {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数失败')
      this.$message.success('获取参数成功')
      res.data.forEach(item => {
        // 判断数据是否为空
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 动态绑定输入框的值
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTabData = res.data
      } else {
        this.onlyTabData = res.data
      }
    },
    // 对话框关闭事件
    addDialogClose () {
      this.$refs.addParamsRef.resetFields()
    },
    // 提交添加分类事件
    addParams () {
      this.$refs.addParamsRef.validate(async vaild => {
        if (!vaild) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addParamsFrom.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.getParamsData()
        this.addDialogVisible = false
        return this.$message.success('添加分类成功')
      })
    },
    // 控制编辑对话框
    editParams (paramsInfo) {
      this.editParamsFrom.attrId = paramsInfo.attr_id
      this.editParamsFrom.attr_name = paramsInfo.attr_name
      this.editParamsFrom.attr_sel = paramsInfo.attr_sel
      console.log(this.editParamsFrom)
      this.editDialogVisible = true
    },
    // 提交from表单
    editSubParams () {
      this.$refs.editParamsRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editParamsFrom.attrId}`, this.editParamsFrom)
        if (res.meta.status !== 200) return this.$message.error('编辑分类失败')
        this.$message.success('编辑成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    delectParams (delInfo) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${delInfo.attr_id}`)
        if (res.meta.status !== 200) return this.$message.error('删除分类失败')
        this.$message.success('删除成功')
        this.getParamsData()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 文本框失去焦点或按下enter触发
    handleInputConfirm (item) {
      if (item.inputValue.trim().length === 0) {
        item.inputValue = ''
        item.inputVisible = false
        return
      }
      // 如果没有retrun则证明需要将数据进行后续处理
      item.attr_vals.push(item.inputValue.trim())
      item.inputValue = ''
      item.inputVisible = false
      this.saveAttrVal(item)
    },
    async saveAttrVal (item) {
      const attrObj = {
        attr_name: item.attr_name,
        attr_sel: item.attr_sel,
        attr_vals: item.attr_vals.join(' ')
      }
      // 发起请求，将此次操作保存
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${item.attr_id}`, attrObj)
      if (res.meta.status !== 200) return this.$message.error('更新属性不成功')
      this.$message.success('更新属性成功')
    },
    // 点击按钮显示文本框
    showInput (item) {
      item.inputVisible = true
      // 让文本获取焦点
      // $nextTick 方法的作用，就是当页面上的元素被重新渲染过后才会执行回调函数的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对于的参数可选项
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVal(row)
    }
  },
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    isBtnDisabled () {
      if (this.cateKeys.length !== 3) return true
      return false
    },
    // 获取到3级id
    cateId () {
      if (this.cateKeys.length === 3) return this.cateKeys[this.cateKeys.length - 1]
      return null
    },
    // 动态计算控制对话框的title
    titleText () {
      if (this.activeName === 'many') return '动态参数'
      return '静态参数'
    }
  }
}
</script>

<style lang="less" scope>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 5px;
}
.input-new-tag {
    width: 90px !important;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
