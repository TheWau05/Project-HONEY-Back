const supabase = require('../config/supabase')

exports.test = async (req, res) => {
  const { data, error } = await supabase
    .from('person')
    .select('*')
    .limit(1)

  if (error) {
    return res.status(500).json(error)
  }

  res.json(data)
}