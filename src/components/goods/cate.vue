<template>
  <div>
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <!-- 添加商品按钮区域 -->
        <el-button type="primary" @click="addCate">添加商品</el-button>
      </el-row>
      <!-- 表格 -->
      <tree-table
      class="treetable"
      :data="cateList"
      :columns="columns"
      :selection-type="false"
      :expand-type="false"
      show-index
      index-text="#"
      border
      >
      <!-- 是否有效 -->
      <template slot="flag" slot-scope="scope">
        <i :class="scope.row.cat_deleted ? 'el-icon-success':'el-icon-error'"></i>
      </template>
      <!-- 排序 -->
      <template slot="order" slot-scope="scope">
        <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
        <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
        <el-tag type="warning" size="mini" v-else>三级</el-tag>
      </template>
      <!-- 操作 -->
      <template slot="opt" slot-scope="scope">
        <el-button type="primary" size="mini" icon="el-icon-edit" @click="editCatecase(scope.row)">编辑</el-button>
        <el-button type="danger" @click="deleteCate(scope.row)" size="mini" icon="el-icon-delete">删除</el-button>
      </template>
      </tree-table>
      <!-- 分页操作 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
    title="添加分类"
    :visible.sync="adddialogVisible"
    width="50%"
    @close="adddialogClosed">
    <el-form :model="addRuleForm" :rules="addRules" ref="addRuleFormRef" label-width="100px">
      <el-form-item label="分类名称:" prop="cat_name">
        <el-input v-model="addRuleForm.cat_name"></el-input>
      </el-form-item>
      <el-form-item label="父级名称:">
        <!-- options 用来指定数据源 -->
        <!-- props用来指定配置对象 -->
        <el-cascader
        expandTrigger="hover"
        v-model="selectvalue"
        :props="cascaderProps"
        :options="parentCateList"
        @change="parentCateChanged"
        clearable>
        </el-cascader>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="adddialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addSubCate">确 定</el-button>
    </span>
  </el-dialog>
  <!-- 编辑分类的对话框 -->
  <el-dialog
    title="提示"
    :visible.sync="editdialogVisible"
    width="50%">
    <el-form :model="editRuleForm" :rules="editRules" ref="editRuleFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editRuleForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级名称:">
          <!-- options 用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
          v-model="editkeys"
          :props="cascaderProps"
          :options="parentCateList"
          disabled
          clearable>
          </el-cascader>
        </el-form-item>
    </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editSubCate">确 定</el-button>
      </span>
  </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类的列表
      cateList: [],
      total: 0,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 为table指定列的定义
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        // 表示将当前列定义为模板列
        type: 'template',
        // 表示当前列所使用的名称
        template: 'flag'
      }, {
        label: '排序',
        // 表示将当前列定义为模板列
        type: 'template',
        // 表示当前列所使用的名称
        template: 'order'
      }, {
        label: '操作',
        // 表示将当前列定义为模板列
        type: 'template',
        // 表示当前列所使用的名称
        template: 'opt'
      }],
      addRuleForm: {
        // 将要添加的校验名称
        cat_name: '',
        // 父分类的id
        cat_pid: 0,
        // 要添加分类的等级，默认要添加的是一级分类
        cat_level: 0
      },
      addRules: {
        cat_name: [
          { required: true, message: '请输入商品分类', trigger: 'blur' },
          { min: 2, max: 16, message: '长度在 2 到 16 个字符', trigger: 'blur' }
        ]
      },
      // 控制添加用户表单的显示与隐藏
      adddialogVisible: false,
      parentCateList: [],
      // 指定级联选择器配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        // 可以选择任意的标签
        checkStrictly: true
      },
      // 选中的父级分裂的id数组
      selectvalue: [],
      // 控制打开编辑对话框
      editdialogVisible: false,
      // 将要被编辑的分类
      editCase: {
        cat_id: 0,
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 修改分类的数据
      editRuleForm: {
        cat_name: ''
      },
      editRules: {
        cat_name: [
          { required: true, message: '请输入商品分类', trigger: 'blur' },
          { min: 2, max: 16, message: '长度在 2 到 16 个字符', trigger: 'blur' }
        ]
      },
      // 编辑分类的父id
      editkeys: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      this.cateList = res.data.result
      this.total = res.data.total
      console.log(this.cateList)
    },
    // 监听page改变函数
    handleSizeChange (newsize) {
      this.queryInfo.pagesize = newsize
      this.getCateList()
    },
    // 监听页面显示改变函数
    handleCurrentChange (newpage) {
      this.queryInfo.pagenum = newpage
      this.getCateList()
    },
    addCate () {
      this.getParentCateList()
      this.adddialogVisible = true
    },
    // 获取父分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('数据获取失败')
      this.parentCateList = res.data
      console.log(this.parentCateList)
    },
    // 选择项变化时触发
    parentCateChanged () {
      console.log(this.selectvalue)
      // 如果selectvalue发生改变则addRuleForm的数据也要跟着改变
      if (this.selectvalue.length > 0) {
        this.addRuleForm.cat_pid = this.selectvalue[this.selectvalue.length - 1]
        this.addRuleForm.cat_level = this.selectvalue.length
      } else {
        this.addRuleForm.cat_pid = 0
        this.addRuleForm.cat_level = 0
      }
    },
    // 添加分类确定按钮事件
    addSubCate () {
      this.$refs.addRuleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addRuleForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功')
        this.getCateList()
        this.adddialogVisible = false
      })
    },
    // 关闭表单时重置表单
    adddialogClosed () {
      this.$refs.addRuleFormRef.resetFields()
      this.selectvalue = []
      this.addRuleForm.cat_pid = 0
      this.addRuleForm.cat_level = 0
    },
    // 编辑对话框分类的操作
    editCatecase (editInfo) {
      console.log(editInfo)
      this.getParentCateList()
      this.editkeys = editInfo.cat_pid
      this.editRuleForm.cat_name = editInfo.cat_name
      this.editCase.cat_id = editInfo.cat_id
      this.editCase.cat_name = editInfo.cat_name
      this.editCase.cat_pid = editInfo.cat_pid
      this.editCase.cat_level = editInfo.cat_level
      this.editdialogVisible = true
    },
    // 提交编辑信息
    editSubCate () {
      this.$refs.editRuleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.editCase.cat_id}`, this.editRuleForm)
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('编辑分类失败')
        this.$message.success('编辑成功')
        this.getCateList()
        this.editdialogVisible = false
      })
    },
    // 删除分类
    deleteCate (delInfo) {
      this.$confirm('此操作将永久删除该分类，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${delInfo.cat_id}`)
        if (res.meta.status !== 200) return this.$message.error('删除用户失败')
        this.$message.success('删除用户成功')
        this.getCateList()
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-icon-success {
  color: lightgreen;
}
.el-icon-error {
  color: red;
}
.treetable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
