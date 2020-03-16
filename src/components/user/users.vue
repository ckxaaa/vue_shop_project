<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList" ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表视图 -->
      <el-table
        border
        stripe
        style="width: 100%"
        :data="allUsers">
        <el-table-column
        type="index"
        label="#"
        >
        </el-table-column>
        <el-table-column
        prop="username"
        label="用户名"
        >
        </el-table-column>
        <el-table-column
        prop="mobile"
        label="电话"
        >
        </el-table-column>
        <el-table-column
        prop="email"
        label="邮箱"
        >
        </el-table-column>
        <el-table-column
        prop="role_name"
        label="角色"
        >
        </el-table-column>
        <el-table-column
        label="状态"
        >
        <!-- 作用域插槽 -->
        <template slot-scope="scope">
          <el-switch
          v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
          </el-switch>
        </template>
        </el-table-column>
        <el-table-column
        label="操作"
        >
        <template slot-scope="scope">
            <el-button size="min" type="primary" @click="showEditInfo(scope.row)" icon="el-icon-edit" circle></el-button>
            <el-button size="min" type="danger" @click="open(scope.row)" icon="el-icon-delete" circle></el-button>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button size="min" type="warning" icon="el-icon-setting" circle></el-button>
            </el-tooltip>
        </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog
    title="添加用户"
    :visible.sync="addDialogVisible"
    width="50%"
    @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRulesForm" label-width="70px">
        <el-form-item label="用户名" prop="username">
        <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码"  prop="password">
        <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
        <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
        <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
      <el-button @click="addDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addUser">确 定</el-button>
    </span>
    </el-dialog>
    <!-- 编辑用户对话框 -->
    <el-dialog
    title="修改用户"
    :visible.sync="editDialogVisible"
    width="50%"
    @close="editDialogClosed">
    <el-form :model="editForm" :rules="editFormRules" ref="editFormRulesForm" label-width="70px">
      <el-form-item  label="用户名" prop="username">
      <el-input disabled v-model="editForm.username"></el-input>
    </el-form-item>
      <el-form-item label="邮箱" prop="email">
      <el-input v-model="editForm.email"></el-input>
    </el-form-item>
      <el-form-item label="电话" prop="mobile">
      <el-input v-model="editForm.mobile"></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="editDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editUser">确 定</el-button>
    </span>
  </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 自定义检查邮箱规则
    var checkEmail = (rule, value, callback) => {
      const regEmali = /^([a-zA-Z\d])+@[a-zA-Z\d]+\.[a-zA-Z]{3}$/
      if (regEmali.test(value)) return callback()
      callback(new Error('请输入合法的邮箱'))
    }
    // 自定义检差号码规则
    var checkmobile = (rule, value, callback) => {
      const regEmali = /^1[3456789]\d{9}$/
      if (regEmali.test(value)) return callback()
      callback(new Error('请输入合法的号码'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      allUsers: [],
      total: 0,
      state: true,
      // 控制添加用户的对话框显示和隐藏
      addDialogVisible: false,
      // 控制编辑用户的对话框显示和隐藏
      editDialogVisible: false,
      // 添加用户表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加验证表单规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkmobile, trigger: 'blur' }
        ]
      },
      editForm: {
        id: '',
        username: '',
        email: '',
        mobile: ''
      },
      editFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkmobile, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.allUsers = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    // 监听pagesize改变事件
    handleSizeChange (newsize) {
      this.queryInfo.pagesize = newsize
      this.getUserList()
    },
    handleCurrentChange (newpage) {
      this.queryInfo.pagenum = newpage
      this.getUserList()
    },
    // 监听swich开关状态的改变
    async userStateChanged (info) {
      const { data: res } = await this.$http.put(`users/${info.id}/state/${info.mg_state}`)
      if (res.meta.status !== 200) {
        info.ms_state = !info.ms_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    // 监听用户对话框关闭事件
    addDialogClosed () {
      this.$refs.addFormRulesForm.resetFields()
    },
    addUser () {
      this.$refs.addFormRulesForm.validate(async vaild => {
        if (!vaild) return
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('用户创建失败')
        this.$message.success('用户创建成功')
        this.getUserList()
        this.addDialogVisible = false
      })
    },
    editDialogClosed () {
      this.$refs.editFormRulesForm.resetFields()
    },
    async showEditInfo (info) {
      const { data: res } = await this.$http.get(`users/${info.id}`)
      if (res.meta.status !== 200) return this.$message.error('获取用户数据失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editUser () {
      this.$refs.editFormRulesForm.validate(async vaild => {
        if (!vaild) return
        const { data: res } = await this.$http.put(`users/${this.editForm.id}`, this.editForm)
        if (res.meta.status !== 200) return this.$message.error('编辑用户信息失败')
        this.$message.success('编辑成功')
        this.getUserList()
        this.editDialogVisible = false
      })
    },
    open (deleteInfo) {
      this.$confirm('此操作将永久删除该用户，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`users/${deleteInfo.id}`)
        if (res.meta.status !== 200) return this.$message.error('删除用户失败')
        this.$message.success('删除用户成功')
        this.getUserList()
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    }
  }
}
</script>
