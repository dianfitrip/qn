const { PesertaJadwal, User, Jadwal, ProfileAsesi, Skema } = require("../../models");
const response = require("../../utils/response.util");
const { Op } = require("sequelize");

exports.getPesertaByJadwal = async (req, res) => {
  try {
    const { id_jadwal } = req.params;

    const data = await PesertaJadwal.findAll({
      where: { id_jadwal },
      include: [
        { model: User, as: "user" },
        { model: Jadwal, as: "jadwal" }
      ]
    });

    return response.success(res, "List peserta jadwal", data);
  } catch (err) {
    console.error(err);
    return response.error(res, err.message);
  }
};

exports.getAllPesertaGlobal = async (req, res) => {
  try {
    const { status } = req.query; // Menangkap query parameter status
    let whereCondition = {};

    // Filter status jika ada
    if (status === 'terjadwal') {
      // Yang dianggap terjadwal biasanya yang sedang dalam proses
      whereCondition.status_asesmen = { [Op.in]: ['terdaftar', 'pra_asesmen', 'asesmen'] };
    } else if (status) {
      // Untuk status 'kompeten' atau 'belum_kompeten'
      whereCondition.status_asesmen = status;
    }

    const data = await PesertaJadwal.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "user",
          include: [{ model: ProfileAsesi }] // Ambil data NIK dan nama dari profile
        },
        {
          model: Jadwal,
          as: "jadwal",
          include: [{ model: Skema, as: "skema" }] // Ambil nama skema
        }
      ],
      order: [['id_peserta', 'DESC']]
    });

    return response.success(res, "Data peserta berhasil diambil", data);
  } catch (err) {
    console.error(err);
    return response.error(res, err.message);
  }
};