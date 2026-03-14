const ProfileAdmin = require("../../models/profileAdmin.model");
const response = require("../../utils/response.util");

exports.getProfile = async (req, res) => {
  try {
    const data = await ProfileAdmin.findByPk(req.user.id_user);
    
    // Jika data belum ada, kita kirimkan data kosong agar frontend tidak crash
    if (!data) {
      return response.success(res, "Profil admin belum diisi", {});
    }

    response.success(res, "Profil admin ditemukan", data);
  } catch (err) {
    console.error("Get Profile Error:", err);
    response.error(res, err.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    
    // 1. Buat salinan (copy) dari req.body agar bisa dimanipulasi
    const bodyData = { ...req.body };

    // 2. CEK FOTO: Jika ada file foto yang dikirim dari frontend, tambahkan ke bodyData
    if (req.file) {
      bodyData.foto = req.file.filename; 
    }

    // Pastikan id_user dimasukkan ke data yang akan disimpan (untuk keperluan Create)
    const payload = { ...bodyData, id_user: id_user };

    // Cek apakah data profil untuk user ini sudah ada di database
    const existingProfile = await ProfileAdmin.findByPk(id_user);

    if (existingProfile) {
      // JIKA ADA: Lakukan Update
      await ProfileAdmin.update(bodyData, {
        where: { id_user: id_user }
      });
    } else {
      // JIKA BELUM ADA: Lakukan Create (Insert Data Baru)
      await ProfileAdmin.create(payload);
    }

    response.success(res, "Profil admin berhasil diperbarui");
  } catch (err) {
    console.error("Update Profile Error:", err);
    response.error(res, "Gagal menyimpan profil: " + err.message);
  }
};