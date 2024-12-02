import React, { useState, useEffect } from 'react';
import './App.css'; // Eğer özel CSS eklemek isterseniz

function App() {
  // State tanımlamaları
  const [characters, setCharacters] = useState([]);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtre state'leri
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');

  // Sayfalama state'leri
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Seçili karakter state'i
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // Karakter verilerini API'den çekme
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://rickandmortyapi.com/api/character');
        if (!response.ok) {
          throw new Error('Veri çekme hatası');
        }
        const data = await response.json();
        
        // Tüm sayfaları çekme
        const allCharacters = [];
        let currentPage = data;
        
        while (currentPage.info.next) {
          const nextPageResponse = await fetch(currentPage.info.next);
          currentPage = await nextPageResponse.json();
          allCharacters.push(...currentPage.results);
        }
        
        allCharacters.push(...data.results);
        setCharacters(allCharacters);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  // Filtreleme işlevi
  useEffect(() => {
    const filtered = characters.filter(character => 
      character.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
      (statusFilter === '' || character.status === statusFilter) &&
      (speciesFilter === '' || character.species === speciesFilter)
    );

    setFilteredCharacters(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / pageSize));
  }, [characters, nameFilter, statusFilter, speciesFilter, pageSize]);

  // Sayfalama işlevi
  const paginatedCharacters = filteredCharacters.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );

  // Karakter seçme işlevi
  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
  };

  // Sayfa boyutu değiştirme
  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  // Hata durumu
  if (error) {
    return (
      <div className="p-4 text-red-500">
        Veri yüklenirken hata oluştu: {error}
      </div>
    );
  }

  // Yükleme durumu
  if (loading) {
    return <div className="p-4">Yükleniyor...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Rick and Morty Karakter Listesi</h1>
      
      {/* Filtre alanları */}
      <div className="flex space-x-2 mb-4">
        <input 
          type="text"
          placeholder="İsme göre filtrele" 
          className="border p-2 rounded flex-1"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        
        <select 
          className="border p-2 rounded"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tüm Durumlar</option>
          <option value="Alive">Canlı</option>
          <option value="Dead">Ölü</option>
          <option value="unknown">Bilinmiyor</option>
        </select>

        <select 
          className="border p-2 rounded"
          onChange={(e) => setSpeciesFilter(e.target.value)}
        >
          <option value="">Tüm Türler</option>
          <option value="Human">İnsan</option>
          <option value="Alien">Uzaylı</option>
        </select>
      </div>

      {/* Sayfa boyutu seçimi */}
      <div className="mb-4">
        <select 
          className="border p-2 rounded"
          value={pageSize}
          onChange={handlePageSizeChange}
        >
          {[10, 25, 50, 100].map(size => (
            <option key={size} value={size}>
              {size} Sonuç Göster
            </option>
          ))}
        </select>
      </div>

      {/* Karakter Tablosu */}
      {filteredCharacters.length === 0 ? (
        <div className="text-center text-gray-500">
          Filtrelenmiş herhangi bir karakter bulunamadı.
        </div>
      ) : (
        <>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Resim</th>
                <th className="border p-2">İsim</th>
                <th className="border p-2">Durum</th>
                <th className="border p-2">Tür</th>
                <th className="border p-2">Cinsiyet</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCharacters.map(character => (
                <tr 
                  key={character.id} 
                  onClick={() => handleCharacterSelect(character)}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <td className="border p-2 text-center">
                    <img 
                      src={character.image} 
                      alt={character.name} 
                      className="w-12 h-12 rounded-full mx-auto"
                    />
                  </td>
                  <td className="border p-2">{character.name}</td>
                  <td className="border p-2">{character.status}</td>
                  <td className="border p-2">{character.species}</td>
                  <td className="border p-2">{character.gender}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Sayfalama Kontrolleri */}
          <div className="flex justify-between items-center mt-4">
            <button 
              className="border p-2 rounded disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Önceki Sayfa
            </button>
            <span>
              Sayfa {currentPage} / {totalPages}
            </span>
            <button 
              className="border p-2 rounded disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Sonraki Sayfa
            </button>
          </div>
        </>
      )}

      {/* Seçili Karakter Detayları */}
      {selectedCharacter && (
        <div className="mt-4 p-4 border rounded">
          <h2 className="text-xl font-bold mb-4">Karakter Detayları</h2>
          <div className="flex items-center">
            <img 
              src={selectedCharacter.image} 
              alt={selectedCharacter.name} 
              className="w-48 h-48 rounded-lg mr-4"
            />
            <div>
              <p><strong>İsim:</strong> {selectedCharacter.name}</p>
              <p><strong>Durum:</strong> {selectedCharacter.status}</p>
              <p><strong>Tür:</strong> {selectedCharacter.species}</p>
              <p><strong>Cinsiyet:</strong> {selectedCharacter.gender}</p>
              <p><strong>Lokasyon:</strong> {selectedCharacter.location.name}</p>
              <p><strong>Köken:</strong> {selectedCharacter.origin.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;