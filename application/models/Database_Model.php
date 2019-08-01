<?php
class Database_Model extends CI_Model {

	function __construct() { 
         parent::__construct(); 
      }
	  
	public function insert_data($tablo,$data)
		{
			if ($this->db->insert($tablo,$data))
			{
			return true;
			}
		}	
    public function update_data($tablo,$data,$id) 
	{
		$this->db->where('id', $id);
		$this->db->update($tablo ,$data);
		return true;
		}  	

    public function get_tarif($id)
	 {
		 
		 $sql="SELECT kategoriler.adi as katadi, yemekler.* FROM yemekler
               LEFT JOIN kategoriler ON yemekler.kategori_id=kategoriler.Id
			   WHERE yemekler.id=".$id;
		 
		 
		 $query = $this->db->query($sql);
        if($query->num_rows() == 1) {
            return $query->result(); 
        } else {
            return false; 
        }
		 
		 
		 
	 }


		
}

?>	  