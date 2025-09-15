// comment.js - 评论页面脚本
(function(){
  const qs = new URLSearchParams(location.search);
  const activityId = qs.get('activityId') || '';

  // 返回按钮
  document.getElementById('backBtn')?.addEventListener('click', () => {
    if (document.referrer) {
      history.back();
    } else {
      commonUtils.navigateTo('work-circle.html');
    }
  });

  // 简单的活动映射（与 work-circle.html 示例对应）
  const activityMap = {
    'act1': {
      title: '5G 专网部署最佳实践',
      text: '分享了《5G专网部署最佳实践.pdf》，欢迎大家下载查阅。',
      author: '王工',
      time: '2小时前'
    },
    'act2': {
      title: '边缘计算平台选型建议',
      text: '在物联网应用圈提出了关于边缘计算平台选型的问题。',
      author: '李经理',
      time: '1小时前'
    },
    'act3': {
      title: '容器平台实践营（西南站）',
      text: '线下活动报名中，欢迎同事参与技术交流。',
      author: '运营小助手',
      time: '昨天'
    }
  };

  // 渲染活动摘要
  function renderBrief() {
    const brief = document.getElementById('activityBrief');
    const data = activityMap[activityId] || {
      title: '工作圈动态',
      text: '欢迎参与讨论，分享你的观点。',
      author: '同事',
      time: '刚刚'
    };
    brief.innerHTML = `
      <div class="brief-title">${escapeHtml(data.title)}</div>
      <div class="brief-meta">由 ${escapeHtml(data.author)} · ${escapeHtml(data.time)}</div>
      <p class="brief-text">${escapeHtml(data.text)}</p>
    `;
  }

  // 评论存储（localStorage 模拟）
  const storageKey = `comments_${activityId || 'unknown'}`;

  function loadComments(){
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch(e){ return []; }
  }
  function saveComments(list){
    localStorage.setItem(storageKey, JSON.stringify(list));
  }

  function renderComments(){
    const container = document.getElementById('commentList');
    const list = loadComments();
    const items = list.map(c => commentItemHTML(c)).join('');
    container.innerHTML = `
      <h2 class="section-title">全部评论（${list.length}）</h2>
      ${items || '<div class="empty">还没有评论，来抢个沙发吧～</div>'}
    `;
  }

  function commentItemHTML(c){
    const initials = (c.author || '匿').slice(0,1).toUpperCase();
    return `
      <div class="comment-item">
        <div class="comment-avatar">${escapeHtml(initials)}</div>
        <div class="comment-content">
          <div class="comment-author">${escapeHtml(c.author || '匿名用户')}</div>
          <div class="comment-text">${escapeHtml(c.text)}</div>
          <div class="comment-meta">${escapeHtml(c.time)}</div>
        </div>
      </div>
    `;
  }

  function nowTime(){
    const d = new Date();
    const pad = (n)=> (n<10? '0'+n : ''+n);
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // 简单转义
  function escapeHtml(str){
    return (str==null? '' : String(str))
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  // 发布评论
  document.getElementById('submitCommentBtn')?.addEventListener('click', () => {
    const input = document.getElementById('commentInput');
    const text = (input.value || '').trim();
    if (!text) {
      commonUtils.showToast('请输入评论内容', 'error');
      return;
    }
    const list = loadComments();
    list.unshift({
      author: '我',
      text,
      time: nowTime()
    });
    saveComments(list);
    input.value = '';
    renderComments();
    commonUtils.showToast('评论已发布', 'success');
  });

  // 初始化
  renderBrief();
  renderComments();
})();

