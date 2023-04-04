let synchronizeTime: string;

// 初始化
if (this.vertical === '初始化') {
  synchronizeTime = '1970-01-01';
}
// 昨天 
else if (this.vertical === '昨天') {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const year = yesterday.getFullYear();
  const month = (yesterday.getMonth() + 1).toString().padStart(2, '0');
  const day = yesterday.getDate().toString().padStart(2, '0');
  synchronizeTime = `${year}-${month}-${day}`;
  console.log(synchronizeTime);
}
// 时间选择
else if (this.vertical === '选择一个时间') {
  const selectTime = this.dateValue as Date;
  const year = selectTime.getFullYear();
  const month = (selectTime.getMonth() + 1).toString().padStart(2, '0');
  const day = selectTime.getDate().toString().padStart(2, '0');
  synchronizeTime = `${year}-${month}-${day}`;
}
