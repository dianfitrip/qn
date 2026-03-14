const { PesertaJadwal, User, Jadwal, ProfileAsesi, Skema } = require("../../models");
const response = require("../../utils/response.util");
const { Op } = require("sequelize");

exports.getPesertaByJadwal = async (req, res) => {
  try {
    const { id_jadwal } = req.params;

    const data = await PesertaJadwal.findAll({
      where: { id_jadwal },
      include: [
        { 
          model: User, 
          as: "user",
          // Menyertakan ProfileAsesi agar data NIK dan Nama Lengkap muncul
          include: [{ model: ProfileAsesi, as: "ProfileAsesi" }] 
        },
        { 
          model: Jadwal, 
          as: "jadwal",
          // Menyertakan Skema agar nama_skema muncul
          include: [{ model: Skema, as: "skema" }] 
        }
      ],
      distinct: true
    });

    return response.success(res, "List peserta jadwal", data);
  } catch (err) {
    console.error(err);
    return response.error(res, err.message);
  }
};

exports.getAllPesertaGlobal = async (req, res) => {
  try {
    const { status } = req.query; 
    let whereCondition = {};

    // Filter berdasarkan status dari query parameter
    if (status === 'terjadwal') {
      whereCondition.status_asesmen = { [Op.in]: ['terdaftar', 'pra_asesmen', 'asesmen'] };
    } else if (status === 'belum_terjadwal') {
      whereCondition.status_asesmen = { [Op.in]: ['menunggu_jadwal'] }; // Sesuaikan dengan enum di DB jika berbeda
    } else if (status) {
      whereCondition.status_asesmen = status;
    }

    const data = await PesertaJadwal.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "user",
          // Menyertakan ProfileAsesi agar data NIK dan Nama Lengkap muncul di tabel Global
          include: [{ model: ProfileAsesi, as: "ProfileAsesi" }] 
        },
        {
          model: Jadwal,
          as: "jadwal",
          // Menyertakan Skema agar nama_skema muncul di tabel Global
          include: [{ model: Skema, as: "skema" }] 
        }
      ],
      distinct: true 
    });

    return response.success(res, "List peserta jadwal global", data);
  } catch (err) {
    console.error(err);
    return response.error(res, err.message);
  }
};