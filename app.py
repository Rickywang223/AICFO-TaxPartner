#!/usr/bin/env python3
"""
AI CFO · AI原生交互版 · 智能税务合伙人
包含：对话引擎 + 能力中心 + 知识库 + 智能体管理 API
"""
import json, os, uuid, time
from flask import Flask, render_template, request, jsonify, send_from_directory, send_file, redirect

app = Flask(__name__, static_folder='vue-dist', static_url_path='/vue-app')
app.config['SECRET_KEY'] = 'ai-cfo-next-secret'
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

# ========================================
# Data Persistence Helpers
# ========================================
def load_json(filename, default=None):
    path = os.path.join(DATA_DIR, filename)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return default if default is not None else []

def save_json(filename, data):
    path = os.path.join(DATA_DIR, filename)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# ========================================
# 模拟数据
# ========================================
AGENTS = [
    {
        'id': 'agent-assistant',
        'icon': '👩‍💼', 'name': '杨姐的税务助理', 'role': '你的个人税务管家',
        'status': 'urgent', 'badge': '3项紧急',
        'summary': '今天有3件事需要处理',
        'greeting': '早，杨姐。今天有3件事需要你关注：\n1️⃣ 🔴 3张高危发票即将过期（苏宁电器¥456,000·还剩8天）\n2️⃣ 🟠 华中区认证率45%（低于集团均值26个百分点）\n3️⃣ 🟠 距申报截止还有12天（23家未申报）\n\n要先处理哪个？',
        'style': 'professional',
        'tasks': [
            {'id': 't1', 'label': '先看发票', 'intent': 'show_expiring'},
            {'id': 't2', 'label': '分析华中区', 'intent': 'analyze_region', 'params': {'region': '华中区'}},
            {'id': 't3', 'label': '催未申报公司', 'intent': 'urge_unfiled'},
        ],
        'placeholder': '问AI：今天有什么紧急的？',
        'type': 'preset',
    },
    {
        'id': 'agent-certify',
        'icon': '📄', 'name': '发票认证专员', 'role': '专注进项发票认证',
        'status': 'warning', 'badge': '45%完成',
        'summary': '还剩23张待认证',
        'greeting': '你好，当前认证进度41.4%，剩余1,937,407张未认证。\n距截止还有12天，今日需认证87,000张。\n\n有3张高危发票建议优先处理：\n• 苏宁电器 ¥456,000\n• 雪峰致远 ¥12,300\n• 华中·第1分公司 ¥1,200\n\n要开始处理吗？',
        'style': 'concise',
        'tasks': [
            {'id': 't1', 'label': '一键认证高危发票', 'intent': 'certify_urgent'},
            {'id': 't2', 'label': '查看认证趋势', 'intent': 'show_cert_trend'},
            {'id': 't3', 'label': '按区域分析', 'intent': 'analyze_by_region'},
        ],
        'placeholder': '问认证专员：认证进度、异常发票...',
        'type': 'preset',
    },
    {
        'id': 'agent-risk',
        'icon': '⚠️', 'name': '风险预警官', 'role': '合规风险监控',
        'status': 'urgent', 'badge': '2家高危',
        'summary': '新增1家风险公司',
        'greeting': '⚠️ 风险扫描完成，发现以下问题：\n\n🔴 高危·2家\n• 华中·第1分公司 — 风险分92\n  特征：开票量环比+340%，金额避线\n• 深圳·南山分公司 — 风险分85\n  特征：餐饮店开"办公用品"发票38张\n\n🟠 预警·5家\n建议本周内完成排查。',
        'style': 'professional',
        'tasks': [
            {'id': 't1', 'label': '查看高危详情', 'intent': 'show_high_risk'},
            {'id': 't2', 'label': '生成审计底稿', 'intent': 'gen_audit_paper'},
            {'id': 't3', 'label': '导出风险报告', 'intent': 'export_risk_report'},
        ],
        'placeholder': '问预警官：风险公司、稽查建议...',
        'type': 'preset',
    },
    {
        'id': 'agent-declare',
        'icon': '📋', 'name': '申报管家', 'role': '申报进度管理',
        'status': 'normal', 'badge': '96%完成',
        'summary': '距截止还有12天',
        'greeting': '📋 7月申报进度：\n\n✅ 增值税 — 577/600（96.2%）\n🟠 所得税 — 312/600（52.0%）— 截止18日\n✅ 附加税 — 520/600（86.7%）\n\n🔴 未申报：23家\n• 华中区 12家\n• 华南区 8家\n• 华北区 3家\n\n需要我催一下吗？',
        'style': 'concise',
        'tasks': [
            {'id': 't1', 'label': '催未申报公司', 'intent': 'urge_unfiled'},
            {'id': 't2', 'label': '查看申报明细', 'intent': 'show_decl_detail'},
            {'id': 't3', 'label': '导出未申报清单', 'intent': 'export_unfiled_list'},
        ],
        'placeholder': '问管家：申报进度、催办...',
        'type': 'preset',
    },
    {
        'id': 'agent-compliance',
        'icon': '🔍', 'name': '稽查合规师', 'role': '深度合规分析',
        'status': 'warning', 'badge': '新预警',
        'summary': '税负率1.78%正常',
        'greeting': '📊 本月合规健康检查：\n\n💰 税负率分析\n• 增值税预估：¥1,600万（环比+5.2%）\n• 税负率1.78%（行业基准1.5-2.0%）✅ 正常\n\n📄 合规评分：B级 62分\n• 进项认证率41.4%（拖后腿）\n• 过期损失¥315万\n\n💡 建议：华中区认证率提升至70%，可多抵扣¥56万',
        'style': 'professional',
        'tasks': [
            {'id': 't1', 'label': '查看合规报告', 'intent': 'show_compliance_report'},
            {'id': 't2', 'label': '税负趋势分析', 'intent': 'show_tax_trend'},
            {'id': 't3', 'label': '生成审计底稿', 'intent': 'gen_audit_paper'},
        ],
        'placeholder': '问合规师：税负分析、合规检查...',
        'type': 'preset',
    },
]

# ========================================
# Seed data for tools modules
# ========================================
DEFAULT_CAPABILITIES = [
    {"id":"cap-1","name":"发票认证","category":"发票类","icon":"📄","type":"auto","description":"自动调用认证接口，批量认证发票","status":"enabled","steps":[{"name":"提取待认证发票","skill":"sk-extract"},{"name":"提交认证","skill":"sk-certify"}],"trigger":"manual","outputFormat":"json","boundAgents":["agent-certify","agent-assistant"],"createdAt":"2026-07-01"},
    {"id":"cap-2","name":"发票合规检查","category":"发票类","icon":"🔍","type":"ai_assisted","description":"AI分析发票风险，提供合规建议","status":"enabled","steps":[{"name":"风险扫描","skill":"sk-scan"},{"name":"AI分析","skill":"sk-ai-analyze"},{"name":"生成报告","skill":"sk-report"}],"trigger":"manual","outputFormat":"text","boundAgents":["agent-risk","agent-compliance"],"createdAt":"2026-07-01"},
    {"id":"cap-3","name":"月度申报追踪","category":"申报类","icon":"📋","type":"auto","description":"跟踪各公司月度申报进度","status":"enabled","steps":[{"name":"获取申报数据","skill":"sk-get-decl"},{"name":"对比进度","skill":"sk-compare"}],"trigger":"scheduled","outputFormat":"table","boundAgents":["agent-declare","agent-assistant"],"createdAt":"2026-07-01"},
    {"id":"cap-4","name":"风险扫描","category":"风险类","icon":"⚠️","type":"ai_assisted","description":"自动扫描异常开票和风险特征","status":"enabled","steps":[{"name":"数据采集","skill":"sk-collect"},{"name":"规则匹配","skill":"sk-rules"},{"name":"AI评估","skill":"sk-ai-eval"}],"trigger":"scheduled","outputFormat":"text","boundAgents":["agent-risk"],"createdAt":"2026-07-01"},
    {"id":"cap-5","name":"税负分析","category":"数据类","icon":"📊","type":"ai_assisted","description":"多维度税负率分析","status":"enabled","steps":[{"name":"采集税负数据","skill":"sk-tax-data"},{"name":"趋势分析","skill":"sk-trend"},{"name":"生成报告","skill":"sk-report"}],"trigger":"manual","outputFormat":"table","boundAgents":["agent-compliance","agent-assistant"],"createdAt":"2026-07-01"},
    {"id":"cap-6","name":"乐企直连","category":"连接类","icon":"🔌","type":"connection","description":"对接乐企平台获取发票数据","status":"enabled","steps":[],"trigger":"event","outputFormat":"json","boundAgents":["agent-certify","agent-assistant"],"createdAt":"2026-07-01"},
]
DEFAULT_CAP_CATEGORIES = [
    {"id":"cc-1","name":"全部能力","icon":"📦","order":0,"builtin":True},
    {"id":"cc-2","name":"发票类","icon":"📄","order":1,"builtin":False},
    {"id":"cc-3","name":"申报类","icon":"📋","order":2,"builtin":False},
    {"id":"cc-4","name":"风险类","icon":"⚠️","order":3,"builtin":False},
    {"id":"cc-5","name":"数据类","icon":"📊","order":4,"builtin":False},
    {"id":"cc-6","name":"连接类","icon":"🔌","order":5,"builtin":False},
]
DEFAULT_KB_CATEGORIES = [
    {"id":"kb-cat-1","name":"财税法规库","icon":"📁","fileCount":12,"parsedCount":12,"boundAgents":["agent-assistant","agent-certify"],"createdAt":"2026-07-01","updatedAt":"2026-07-16"},
    {"id":"kb-cat-2","name":"企业内部制度","icon":"📁","fileCount":5,"parsedCount":5,"boundAgents":["agent-declare"],"createdAt":"2026-07-01","updatedAt":"2026-07-14"},
    {"id":"kb-cat-3","name":"行业标准","icon":"📁","fileCount":3,"parsedCount":2,"boundAgents":["agent-risk","agent-compliance"],"createdAt":"2026-07-01","updatedAt":"2026-07-17"},
]
DEFAULT_KB_FILES = [
    {"id":"f-1","name":"增值税法2026版.pdf","categoryId":"kb-cat-1","type":"pdf","size":2450000,"status":"parsed","referencedBy":["agent-assistant","agent-certify"],"uploadedAt":"2026-07-16","parsedAt":"2026-07-16 10:30:00","snippet":"第一条 在中华人民共和国境内销售货物或者加工、修理修配劳务...第六十四条 纳税人应当依法如实办理纳税申报..."},
    {"id":"f-2","name":"企业所得税汇算清缴.docx","categoryId":"kb-cat-1","type":"docx","size":1800000,"status":"parsed","referencedBy":["agent-declare"],"uploadedAt":"2026-07-15","parsedAt":"2026-07-15 14:20:00","snippet":"企业应当自年度终了之日起五个月内，向税务机关报送年度企业所得税纳税申报表..."},
    {"id":"f-3","name":"发票管理办法.pdf","categoryId":"kb-cat-1","type":"pdf","size":1200000,"status":"parsed","referencedBy":["agent-certify","agent-risk"],"uploadedAt":"2026-07-15","parsedAt":"2026-07-15 09:00:00","snippet":"任何单位和个人不得有下列虚开发票行为：（一）为他人、为自己开具与实际经营业务情况不符的发票；"},
    {"id":"f-4","name":"公司报销制度2026.docx","categoryId":"kb-cat-2","type":"docx","size":950000,"status":"parsed","referencedBy":["agent-declare"],"uploadedAt":"2026-07-14","parsedAt":"2026-07-14 11:00:00","snippet":"第一条 为规范公司报销流程，提高财务管理效率...第十条 发票认证应在收到发票后15个工作日内完成"},
    {"id":"f-5","name":"供应商准入标准.pdf","categoryId":"kb-cat-2","type":"pdf","size":820000,"status":"parsed","referencedBy":[],"uploadedAt":"2026-07-14","parsedAt":"2026-07-14 16:30:00","snippet":"供应商应具备合法有效的营业执照、税务登记证、相关行业资质证书..."},
    {"id":"f-6","name":"餐饮行业财税指引.pdf","categoryId":"kb-cat-3","type":"pdf","size":2100000,"status":"parsing","referencedBy":["agent-risk"],"uploadedAt":"2026-07-17","parsedAt":"","snippet":""},
    {"id":"f-7","name":"税收征管法2025解读.docx","categoryId":"kb-cat-3","type":"docx","size":1500000,"status":"parsed","referencedBy":["agent-compliance"],"uploadedAt":"2026-07-16","parsedAt":"2026-07-17 08:00:00","snippet":"税务机关应当建立和完善税收征收管理信息系统，实现税收信息的共享..."},
]
DEFAULT_MANAGED_AGENTS = [
    {"id":"magent-1","icon":"🤖","name":"税务合规助手","type":"custom","description":"专注税务合规检查，擅长发票合规、供应商风险评估","style":"professional","capabilities":["cap-2","cap-4"],"knowledgeBases":["kb-cat-1"],"model":"Claude 4","temperature":0.3,"status":"online","proactiveSettings":{"dailyBriefing":{"enabled":True,"time":"08:30"},"emergencyAlert":{"enabled":True}},"stats":{"totalConversations":47,"todayConversations":3,"lastActiveAt":"2026-07-22T09:15:00"},"createdAt":"2026-07-01","updatedAt":"2026-07-22"},
    {"id":"magent-2","icon":"📋","name":"申报专员","type":"custom","description":"直接给结论和行动建议，适合日常税务查询","style":"concise","capabilities":["cap-3"],"knowledgeBases":["kb-cat-2"],"model":"Claude 4","temperature":0.5,"status":"online","proactiveSettings":{"dailyBriefing":{"enabled":False,"time":"08:30"},"emergencyAlert":{"enabled":False}},"stats":{"totalConversations":23,"todayConversations":1,"lastActiveAt":"2026-07-22T08:30:00"},"createdAt":"2026-07-01","updatedAt":"2026-07-22"},
    {"id":"magent-3","icon":"🔍","name":"风险分析师","type":"custom","description":"侧重数据趋势和对比，擅长税务分析和报表解读","style":"data","capabilities":["cap-4","cap-5"],"knowledgeBases":["kb-cat-3"],"model":"GPT-4o","temperature":0.4,"status":"paused","proactiveSettings":{"dailyBriefing":{"enabled":True,"time":"09:00"},"emergencyAlert":{"enabled":True}},"stats":{"totalConversations":15,"todayConversations":0,"lastActiveAt":"2026-07-21T17:00:00"},"createdAt":"2026-07-01","updatedAt":"2026-07-21"},
]

# Load or seed data
def get_data(key, default):
    return load_json(f'{key}.json', default)

capabilities = get_data('capabilities', DEFAULT_CAPABILITIES)
cap_categories = get_data('cap_categories', DEFAULT_CAP_CATEGORIES)
kb_categories = get_data('kb_categories', DEFAULT_KB_CATEGORIES)
kb_files = get_data('kb_files', DEFAULT_KB_FILES)
managed_agents = get_data('managed_agents', DEFAULT_MANAGED_AGENTS)

def persist_all():
    save_json('capabilities.json', capabilities)
    save_json('cap_categories.json', cap_categories)
    save_json('kb_categories.json', kb_categories)
    save_json('kb_files.json', kb_files)
    save_json('managed_agents.json', managed_agents)

# ========================================
# 对话历史缓存（内存，重启丢失）
# ========================================
conversations = {}

@app.route('/')
def index():
    return redirect('/vue-app/#/workspace/agent-assistant')

# ========================================
# Agent Chat API
# ========================================
@app.route('/api/agent/<agent_id>', methods=['GET'])
def get_agent(agent_id):
    agent = next((a for a in AGENTS if a['id'] == agent_id), None)
    if not agent:
        return jsonify({'error': 'Agent not found'}), 404
    return jsonify(agent)

@app.route('/api/agents', methods=['GET'])
def get_agents():
    return jsonify(AGENTS)

@app.route('/api/chat/<agent_id>', methods=['POST'])
def chat(agent_id):
    agent = next((a for a in AGENTS if a['id'] == agent_id), None)
    if not agent:
        return jsonify({'error': 'Agent not found'}), 404
    data = request.json
    user_message = data.get('message', '')
    context = data.get('context', {})
    reply = generate_reply(agent_id, user_message, context)
    return jsonify({'reply': reply, 'agent': agent_id})

def generate_reply(agent_id, message, context):
    msg = message.lower()
    if '认证' in msg or 'certify' in msg:
        return {'type':'action_result','text':'✅ 已提交认证！3张高危发票全部认证成功。\n\n📄 认证结果：\n• 苏宁电气 ✅ 成功\n• 雪峰致远 ✅ 成功\n• 华中·第1分公司 ✅ 成功\n\n💰 预计可抵扣：¥469,500','actions':[{'label':'查看认证记录','intent':'show_cert_history'},{'label':'继续处理其他','intent':'back_to_tasks'}]}
    if '华中' in msg or 'region' in msg or '区域' in msg:
        return {'type':'analysis','text':'📊 华中区认证率45%，低于集团均值26个百分点。\n\n🔍 主要原因：\n• 华中·第1分公司 — 23张超期未认证\n• 华中·第3分公司 — 8张超期\n\n💰 如果全部补认证，可追回 **¥56万**。','cards':[{'type':'data-card','title':'华中区认证趋势','summary':'45% · 低于均值71.2% · 较上月-12%','chart':'bar','dimensions':['第1分公司','第3分公司','第5分公司','第7分公司'],'values':[23,8,3,2],'status':'danger'}],'actions':[{'label':'📨 发督办到华中区','intent':'send_urge','params':{'region':'华中区'}},{'label':'📊 看完整分析','intent':'show_full_analysis'}]}
    if '风险' in msg or 'risk' in msg or '高危' in msg:
        return {'type':'alert','text':'⚠️ 高风险公司详情：\n\n**华中·第1分公司** — 风险分 92\n🔴 开票量环比+340%（23→101张）\n🔴 60张发票金额集中在¥9,900-¥9,999\n🔴 凌晨0-5点开票12张\n\n潜在后果：虚开发票认定，补税+罚款约¥80万','actions':[{'label':'生成审计底稿','intent':'gen_audit_paper'},{'label':'查看明细','intent':'view_risk_detail'},{'label':'标记已处理','intent':'mark_handled'}]}
    if '申报' in msg or 'declare' in msg or '进度' in msg:
        return {'type':'data','text':'📋 当前申报进度：\n\n✅ 增值税 — 577/600（96.2%）\n🟠 所得税 — 312/600（52.0%）— 截止18日\n✅ 附加税 — 520/600（86.7%）\n\n未申报主要集中在华中区（12家）和华南区（8家）。','actions':[{'label':'📨 催办未申报','intent':'urge_unfiled'},{'label':'📊 查看区域分布','intent':'show_region_distribution'}]}
    if '帮助' in msg or 'help' in msg or '能做什么' in msg:
        return {'type':'text','text':'你可以问我这些问题：\n\n📄 **发票认证** — "查一下认证进度" "认证这3张发票"\n📋 **申报管理** — "还有多少没申报" "催一下未申报的"\n⚠️ **风险监控** — "有什么风险" "查一下华中第1分公司"\n💰 **税负分析** — "税负率多少" "为什么高了"\n📊 **数据查询** — "认证率趋势" "按区域分析"\n\n需要试试哪个？','actions':[{'label':'查认证进度','intent':'show_cert_trend'},{'label':'查风险公司','intent':'show_high_risk'},{'label':'看申报进度','intent':'show_decl_detail'}]}
    return {'type':'text','text':f'收到你的消息了。我正在分析...\n\n你说的是："{message}"\n\n我还在学习中，暂时还不能完全理解这个问题。你可以试试：\n• "查一下认证率"\n• "华中区为什么这么低"\n• "帮我认证发票"\n• "有什么风险"\n\n或者需要我找其他智能体帮你吗？','actions':[{'label':'查看帮助','intent':'help'},{'label':'换一个智能体','intent':'switch_agent_suggest'}]}

# ========================================
# 能力中心 API
# ========================================
@app.route('/api/capabilities', methods=['GET'])
def get_capabilities():
    return jsonify(capabilities)

@app.route('/api/capabilities', methods=['POST'])
def create_capability():
    data = request.json
    new_cap = {
        'id': f"cap-{uuid.uuid4().hex[:8]}",
        'name': data.get('name',''),
        'category': data.get('category',''),
        'icon': data.get('icon','🔧'),
        'type': data.get('type','ai_assisted'),
        'description': data.get('description',''),
        'status': 'enabled',
        'steps': data.get('steps',[]),
        'trigger': data.get('trigger','manual'),
        'outputFormat': data.get('outputFormat','text'),
        'boundAgents': [],
        'createdAt': time.strftime('%Y-%m-%d'),
    }
    capabilities.append(new_cap)
    persist_all()
    return jsonify(new_cap), 201

@app.route('/api/capabilities/<cap_id>', methods=['PUT'])
def update_capability(cap_id):
    data = request.json
    cap = next((c for c in capabilities if c['id'] == cap_id), None)
    if not cap:
        return jsonify({'error':'Not found'}), 404
    for k in ['name','category','icon','type','description','status','steps','trigger','outputFormat']:
        if k in data:
            cap[k] = data[k]
    persist_all()
    return jsonify(cap)

@app.route('/api/capabilities/<cap_id>', methods=['DELETE'])
def delete_capability(cap_id):
    global capabilities
    cap = next((c for c in capabilities if c['id'] == cap_id), None)
    if not cap:
        return jsonify({'error':'Not found'}), 404
    capabilities = [c for c in capabilities if c['id'] != cap_id]
    persist_all()
    return jsonify({'ok': True})

@app.route('/api/cap-categories', methods=['GET'])
def get_cap_categories():
    return jsonify(cap_categories)

# ========================================
# 知识库 API
# ========================================
@app.route('/api/kb/categories', methods=['GET'])
def get_kb_categories():
    return jsonify(kb_categories)

@app.route('/api/kb/categories', methods=['POST'])
def create_kb_category():
    data = request.json
    new_cat = {
        'id': f"kb-cat-{uuid.uuid4().hex[:8]}",
        'name': data.get('name',''),
        'icon': data.get('icon','📁'),
        'fileCount': 0,
        'parsedCount': 0,
        'boundAgents': [],
        'createdAt': time.strftime('%Y-%m-%d'),
        'updatedAt': time.strftime('%Y-%m-%d'),
    }
    kb_categories.append(new_cat)
    persist_all()
    return jsonify(new_cat), 201

@app.route('/api/kb/categories/<cat_id>', methods=['DELETE'])
def delete_kb_category(cat_id):
    global kb_categories, kb_files
    kb_categories = [c for c in kb_categories if c['id'] != cat_id]
    kb_files = [f for f in kb_files if f['categoryId'] != cat_id]
    persist_all()
    return jsonify({'ok': True})

@app.route('/api/kb/files', methods=['GET'])
def get_kb_files():
    cat_id = request.args.get('categoryId', '')
    if cat_id:
        return jsonify([f for f in kb_files if f['categoryId'] == cat_id])
    return jsonify(kb_files)

@app.route('/api/kb/files', methods=['POST'])
def upload_kb_file():
    data = request.json
    new_file = {
        'id': f"f-{uuid.uuid4().hex[:8]}",
        'name': data.get('name',''),
        'categoryId': data.get('categoryId',''),
        'type': data.get('type','pdf'),
        'size': data.get('size',0),
        'status': 'parsing',
        'referencedBy': [],
        'uploadedAt': time.strftime('%Y-%m-%d'),
        'parsedAt': '',
        'snippet': '文件解析中，内容预览暂不可用...',
    }
    kb_files.append(new_file)
    # Update category count
    cat = next((c for c in kb_categories if c['id'] == new_file['categoryId']), None)
    if cat:
        cat['fileCount'] = cat.get('fileCount',0) + 1
        cat['updatedAt'] = time.strftime('%Y-%m-%d')
    persist_all()
    return jsonify(new_file), 201

@app.route('/api/kb/files/<file_id>', methods=['DELETE'])
def delete_kb_file(file_id):
    global kb_files
    f = next((x for x in kb_files if x['id'] == file_id), None)
    if f:
        cat = next((c for c in kb_categories if c['id'] == f['categoryId']), None)
        if cat:
            cat['fileCount'] = max(0, cat.get('fileCount',0) - 1)
    kb_files = [x for x in kb_files if x['id'] != file_id]
    persist_all()
    return jsonify({'ok': True})

@app.route('/api/kb/files/<file_id>/simulate-parse', methods=['POST'])
def simulate_parse(file_id):
    f = next((x for x in kb_files if x['id'] == file_id), None)
    if not f:
        return jsonify({'error':'Not found'}), 404
    f['status'] = 'parsed'
    f['parsedAt'] = time.strftime('%Y-%m-%d %H:%M:%S')
    f['snippet'] = '已完成解析，AI 智能体可引用此文件内容。' if not f.get('snippet') or '解析中' in f.get('snippet','') else f['snippet']
    cat = next((c for c in kb_categories if c['id'] == f['categoryId']), None)
    if cat:
        cat['parsedCount'] = cat.get('parsedCount',0) + 1
    persist_all()
    return jsonify(f)

# ========================================
# 智能体管理 API
# ========================================
@app.route('/api/managed-agents', methods=['GET'])
def get_managed_agents():
    return jsonify(managed_agents)

@app.route('/api/managed-agents', methods=['POST'])
def create_managed_agent():
    data = request.json
    new_agent = {
        'id': f"magent-{uuid.uuid4().hex[:8]}",
        'icon': data.get('icon','🤖'),
        'name': data.get('name',''),
        'type': 'custom',
        'description': data.get('description',''),
        'style': data.get('style','professional'),
        'capabilities': data.get('capabilities',[]),
        'knowledgeBases': data.get('knowledgeBases',[]),
        'model': data.get('model','Claude 4'),
        'temperature': data.get('temperature',0.3),
        'status': 'online',
        'proactiveSettings': data.get('proactiveSettings',{'dailyBriefing':{'enabled':False,'time':'08:30'},'emergencyAlert':{'enabled':False}}),
        'stats': {'totalConversations':0,'todayConversations':0,'lastActiveAt':''},
        'createdAt': time.strftime('%Y-%m-%d'),
        'updatedAt': time.strftime('%Y-%m-%d'),
    }
    managed_agents.append(new_agent)
    persist_all()
    return jsonify(new_agent), 201

@app.route('/api/managed-agents/<agent_id>', methods=['PUT'])
def update_managed_agent(agent_id):
    data = request.json
    a = next((x for x in managed_agents if x['id'] == agent_id), None)
    if not a:
        return jsonify({'error':'Not found'}), 404
    for k in ['icon','name','description','style','capabilities','knowledgeBases','model','temperature','status','proactiveSettings']:
        if k in data:
            a[k] = data[k]
    a['updatedAt'] = time.strftime('%Y-%m-%d')
    persist_all()
    return jsonify(a)

@app.route('/api/managed-agents/<agent_id>', methods=['DELETE'])
def delete_managed_agent(agent_id):
    global managed_agents
    managed_agents = [x for x in managed_agents if x['id'] != agent_id]
    persist_all()
    return jsonify({'ok': True})

@app.route('/api/managed-agents/<agent_id>/toggle-status', methods=['POST'])
def toggle_agent_status(agent_id):
    a = next((x for x in managed_agents if x['id'] == agent_id), None)
    if not a:
        return jsonify({'error':'Not found'}), 404
    a['status'] = 'paused' if a['status'] == 'online' else 'online'
    a['updatedAt'] = time.strftime('%Y-%m-%d')
    persist_all()
    return jsonify(a)

@app.route('/vue-app/')
def serve_vue_index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    print("🚀 AI CFO Next (AI原生交互版) 启动中...")
    print("🌐 http://localhost:5003")
    app.run(host='0.0.0.0', port=5003, debug=True)


