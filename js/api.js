import { supabase } from './supabaseClient.js';

/** Submissions of current user in last 30 days */
export async function fetchMyRecentSubmissions() {
  const { data: { user } } = await supabase.auth.getUser();
  const since = new Date(); since.setDate(since.getDate()-30);
  const { data, error } = await supabase
    .schema('app')
    .from('submission')
    .select('id, created_at, case_type, urgency, anamnesis, division, department')
    .eq('user_id', user.id)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createSubmission(payload) {
  const { data: { user } } = await supabase.auth.getUser();
  payload.user_id = user.id;
  const { data, error } = await supabase.schema('app').from('submission').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function createSamplingEvent(submission_id, payload) {
  const row = { submission_id, ...payload };
  const { data, error } = await supabase.schema('app').from('sampling_event').insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function createLabGroup(submission_id, lab, site) {
  const row = { submission_id, lab, site, status: 'REQUESTED' };
  const { data, error } = await supabase.schema('app').from('lab_group').insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function addSample(submission_id, payload) {
  const row = { submission_id, ...payload };
  const { data, error } = await supabase.schema('app').from('sample').insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function createAliquot(sample_id, lab_group_id, barcode_value) {
  const row = { sample_id, lab_group_id, barcode_value };
  const { data, error } = await supabase.schema('app').from('aliquot').insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function fetchMyReports({ page=1, pageSize=10, q='' }={}) {
  const from = (page-1)*pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .schema('app')
    .from('v_my_labgroup_reports')
    .select('lab_group_id,lab,site,status,created_at,updated_at,submission_id,result_count,aliquot_count,first_accepted_date,eta_target', { count: 'exact' })
    .eq('status','RELEASED')
    .order('updated_at', { ascending:false })
    .range(from, to);
  if (q) {
    query = query.or(`lab.ilike.%${q}%,site.ilike.%${q}%,lab_group_id.ilike.%${q}%,submission_id.ilike.%${q}%`);
  }
  const { data, count, error } = await query;
  if (error) throw error;
  return { data: data||[], total: count||0 };
}

export async function fetchRole() {
  const { data, error } = await supabase.schema('app').from('user_profile').select('role,name').single();
  if (error) return { role: 'USER', name: 'User' };
  return data;
}

/** Staff endpoints **/
export async function adminIntakeList(limit=50) {
  const { data, error } = await supabase
    .schema('app')
    .from('lab_group')
    .select('id,lab,site,status,submission_id,first_accepted_date,created_at')
    .neq('status','REJECTED')
    .order('created_at', { ascending:false })
    .limit(limit);
  if (error) throw error;
  return data||[];
}

export async function acceptAliquot(aliquot_id) {
  const { data, error } = await supabase.schema('app').from('aliquot').update({ accepted_at: new Date().toISOString() }).eq('id', aliquot_id).select().single();
  if (error) throw error;
  return data;
}

export async function setLabGroupStatus(lg_id, status, note='') {
  const { data, error } = await supabase.schema('app').from('lab_group').update({ status }).eq('id', lg_id).select().single();
  if (error) throw error;
  return data;
}

export async function rejectLabGroup(lg_id, reason) {
  await supabase.schema('app').from('attachment').insert({ owner_kind:'LABGROUP', owner_id: lg_id, note: `REJECTED: ${reason}`, file_uri: 'text://reason' });
  return setLabGroupStatus(lg_id, 'REJECTED', reason);
}

export async function listAliquotsByLabGroup(lg_id) {
  const { data, error } = await supabase.schema('app').from('aliquot').select('id,barcode_value,accepted_at,sample_id').eq('lab_group_id', lg_id).order('created_at', { ascending:true });
  if (error) throw error;
  return data||[];
}

export async function listResultsByAliquot(aliquot_id) {
  const { data, error } = await supabase.schema('app').from('result').select('id,parameter_id,value_kind,value_numeric,value_text,value_qual,unit,method,instrument,analyzed_at').eq('aliquot_id', aliquot_id).order('created_at', { ascending:true });
  if (error) throw error;
  return data||[];
}

export async function upsertResult(aliquot_id, row) {
  const payload = { aliquot_id, ...row };
  if (row.parameter_code) {
    const { data: p } = await supabase.schema('app').from('test_parameter').select('id').eq('code', row.parameter_code).single();
    if (p) payload.parameter_id = p.id;
    delete payload.parameter_code;
  }
  const { data, error } = await supabase.schema('app').from('result').insert(payload).select().single();
  if (error) throw error;
  return data;
}
