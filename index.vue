<template>
<Modal v-model="synChroniz" title="同步选项" @on-ok="ok" @on-cancel="cancel" width="500" height="500">
        <Input v-model="value3" size="small" placeholder="small size" disabled />
        <RadioGroup v-model="vertical" vertical>
          <Radio label="初始化">
            <Icon type="social-apple"></Icon>
            <span>初始化</span>
          </Radio>
          <Radio label="选择昨天">
            <Icon type="social-android"></Icon>
            <span>昨天</span>
          </Radio>
          <Radio label="选择一个时间">
            <Icon type="social-windows"></Icon>
            <span>选择一个时间</span>
          </Radio>
          <DatePicker v-model="dateValue" type="date" placeholder="请选择一个时间" style="width: 200px"
            v-if="vertical === '选择一个时间'"></DatePicker>
        </RadioGroup>
      </Modal>
      <template/>
     <script>
     methods:{
      ok() {
      this.$Message.info(this.vertical + "成功");
      if (this.vertical === '初始化') {
        this.postData.synchronizeTime = new Date(1970 - 1 - 1).toLocaleDateString().replace(/\//g, '-');
        console.log(this.postData);
        addTime(this.postData, 'json').then(() => {
          this.$Message.success('添加成功')
          console.log(this.postData);
        })
        console.log("a");
      } else if (this.vertical === '选择昨天') {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        this.postData.synchronizeTime = yesterday.toLocaleDateString().replace(/\//g, '-')
        console.log(this.postData.synchronizeTime);
        addTime(this.postData, 'json').then(() => {
          this.$Message.success('添加成功')
          console.log(this.postData);
        })
        console.log("b");
      } else if (this.vertical === "选择一个时间") {
        console.log("c");
        this.postData.synchronizeTime = this.dateValue.toLocaleDateString().replace(/\//g, '-');
        addTime(this.postData, 'json').then(() => {
          this.$Message.success('添加成功')
          console.log(this.postData);
        })
        console.log(this.postData.synchronizeTime);
      }
      this.synChroniz = false;
    },
    cancel() {
      this.$Message.info("关闭");
    }
    }
    <script/>
