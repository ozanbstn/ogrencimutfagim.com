<?php
class Kullanicilar extends CI_Controller {

        public function __construct()
        {
                parent::__construct();
                
				$this->load->database(); 
				$this->load->helper(array('form', 'url'));
				$this->load->model('Database_Model');
		}

public function index()
	{
		$query=$this->db->get("uyeler"); 
        $data["veri"]=$query->result(); 
		
		$data["title"]="Kullanıcı Listeleme Sayfası";
		
		$this->load->view('admin/header',$data);
		$this->load->view('admin/sidebar');
		$this->load->view('admin/kullanici_listesi',$data);
		$this->load->view('admin/footer');
	}

public function ekle()
{
	$data["title"]="Kullanıcı Ekleme Sayfası";
	$this->load->view('admin/header',$data);
	$this->load->view('admin/sidebar');
	$this->load->view('admin/kullanici_ekle');
	$this->load->view('admin/footer');
}	
	
public function kaydet()
{
	$data=array(
		'adi' => $this->input->post('adi'),
		'soyadi' => $this->input->post('soyadi'),
		'email' => $this->input->post('email'),
		'sifre' => $this->input->post('sifre'),
		'yetki' => $this->input->post('yetki')
		);
		
		$this->Database_Model->insert_data("uyeler",$data);
		redirect(base_url()."admin/kullanicilar");
}	
	
public function sil($id)
{
	$this->db->query('DELETE FROM uyeler WHERE id='.$id);
	redirect(base_url()."admin/kullanicilar");
}

public function duzenle($id)
	{
		$query = $this->db->get_where("uyeler",array("id"=>$id)); 
        $data['veri'] = $query->result(); 
		$data["title"]="Kullanıcı Düzenleme Sayfası";
		
		$this->load->view('admin/header',$data);
		$this->load->view('admin/sidebar');
		$this->load->view('admin/kullanici_duzenle',$data);
		$this->load->view('admin/footer');
	}	
public function guncelle($id)
	{
		
	    $data=array(
		'adi' => $this->input->post('adi'),
		'soyadi' => $this->input->post('soyadi'),
		'email' => $this->input->post('email'),
		'sifre' => $this->input->post('sifre'),
		'yetki' => $this->input->post('yetki'),
		);
		$this->Database_Model->update_data("uyeler",$data,$id);
		
		redirect(base_url()."admin/kullanicilar");
		
	}		
	
	
}