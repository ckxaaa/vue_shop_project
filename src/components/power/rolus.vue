<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <!-- 添加角色按钮区域 -->
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
        <!-- 角色列表区域 -->
      <el-table :data="rolusList" border stripe style="width: 100%">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bd-botton', 'vccenter', i1 === 0?'bd-botton':'']" v-for="(item, i1) in scope.row.children" :key="item.id">
              <el-col :span="5">
                <el-tag type="primary" closable @close="removeById(scope.row, item.id)" > {{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row :class="['bd-botton', 'vccenter', i2 === 0?'bd-botton':'']" v-for="(children1, i2) in item.children" :key="children1.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeById(scope.row, children1.id)"> {{children1.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-row class="bd-botton" v-for="children2 in children1.children" :key="children2.id">
                      <el-tag type="warning" closable @close="removeById(scope.row, children2.id)"> {{children2.authName}}</el-tag>
                    </el-row>
                  </el-col>
                </el-row>
              </el-col>
          </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column width="50" type="index" label="#"></el-table-column>
        <el-table-column width="300" prop="roleName" label="角色名称"></el-table-column>
        <el-table-column width="300"  prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editInfo(scope.row)">编辑角色</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="open(scope.row)">删除角色</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="setRigth(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
        <!-- <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
        </el-pagination> -->
    </el-card>
    <!-- 添加角色的对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="addDialogVisible"
      width="50%"
      :before-close="addDialogClosed">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules">
        <el-form-item label="角色名" prop="roleName">
        <el-input v-model="addForm.roleName" ></el-input>
        </el-form-item >
        <el-form-item label="角色描述" prop="roleDesc">
        <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addrole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色的对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="editDialogVisible"
      width="50%"
      :close="editDialogClosed">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules">
        <el-form-item label="角色名" prop="roleName">
        <el-input v-model="editForm.roleName" ></el-input>
        </el-form-item >
        <el-form-item label="角色描述" prop="roleDesc">
        <el-input v-model="editForm.roleDesc" ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editrole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRigthdialogVisible"
      width="50%"
      @close="setRigthDialogClosed">
      <!-- 树型控件 -->
      <el-tree :data="rigthTree"
               :props="rigthProps"
                show-checkbox
                node-key="id"
                default-expand-all
                :default-checked-keys="defaultkey"
                ref="rigthTreeRef">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRigthdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allRigths">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 分页数据
      // total: 0,
      // queryInfo: {
      //   query: '',
      //   pagenum: 1,
      //   pagesize: 2
      // },
      rolusList: [],
      addDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ]
      },
      editForm: {
        id: '',
        roleName: '',
        roleDesc: ''
      },
      editDialogVisible: false,
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ]
      },
      // 控制分配分配权限对话框
      setRigthdialogVisible: false,
      // 获取到所有权限数据为树结构
      rigthTree: [],
      rigthProps: {
        children: 'children',
        label: 'authName'
      },
      // 已经被分配的权限
      defaultkey: [],
      // 将要分配权限的id
      roleId: ''
    }
  },
  created () {
    this.getRolusList()
  },
  methods: {
    // 获取所有角色
    async getRolusList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.total = res.data.length
      this.rolusList = res.data
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    async addrole () {
      const { data: res } = await this.$http.post('roles', this.addForm)
      if (res.meta.status !== 201) return this.$message.error('创建角色失败')
      this.$message.success('创建角色成功')
      this.getRolusList()
      this.addDialogVisible = false
    },
    // 控制分页函数
    // handleSizeChange (newsize) {
    //   this.queryInfo.pagesize = newsize
    //   this.getRolusList()
    // },
    // handleCurrentChange (newnum) {
    //   this.queryInfo.pagenum = newnum
    //   this.getRolusList()
    // },
    // 获取编辑角色的信息
    editInfo (rule) {
      this.editForm.id = rule.id
      this.editForm.roleName = rule.roleName
      this.editForm.roleDesc = rule.roleDesc
      this.editDialogVisible = true
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 提交编辑之后的信息
    editrole () {
      this.$refs.editFormRef.validate(async vaild => {
        if (!vaild) return
        const { data: res } = await this.$http.put(`roles/${this.editForm.id}`, this.editForm)
        if (res.meta.status !== 200) return this.$message.error('编辑角色信息失败')
        this.$message.success('编辑成功')
        this.getRolusList()
        this.editDialogVisible = false
      })
    },
    open (roleInfo) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${roleInfo.id}`)
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        this.$message.success('删除成功')
        this.getRolusList()
      }).catch(() => {
        this.$message.info('已经取消删除')
      })
    },
    // 根据id删除权限
    removeById (role, rigthId) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rigthId}`)
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        this.$message.success('删除成功')
        // this.getRolusList()
        role.children = res.data
      }).catch(() => {
        this.$message.info('取消删除')
      })
    },
    // 分配权限
    async setRigth (role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限失败')
      this.rigthTree = res.data
      console.log(this.rigthTree)
      // 将分配好的权限加载到树结构中
      this.getLeafKeys(role, this.defaultkey)
      this.setRigthdialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id,并保存到rigthkey
    getLeafKeys (node, arry) {
      if (!node.children) return arry.push(node.id)
      node.children.forEach(item => {
        this.getLeafKeys(item, arry)
      })
    },
    // 关闭时清空分配权限的Dialog
    setRigthDialogClosed () {
      this.defaultkey = []
    },
    // 点击为权限分配期限
    async allRigths () {
      const keys = [
        ...this.$refs.rigthTreeRef.getCheckedKeys(),
        ...this.$refs.rigthTreeRef.getHalfCheckedKeys()
      ]
      const keysId = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: keysId })
      if (res.meta.status !== 200) this.$message.error('更新权限失败')
      this.getRolusList()
      this.setRigthdialogVisible = false
      this.$message.success('更新成功')
    }
  }
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }
  .bd-botton{
    border-top: 1px solid #eee
  }
  .bd-botton{
    border-bottom: 1px solid #eee
  }
  .vccenter{
    display: flex;
    align-items: center;
  }
</style>
