import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { logService } from '../services/logService';

// Yükleme animasyonu için keyframe
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Yeni styled componentler
const LoadingIcon = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(108, 92, 231, 0.1);
  border-top: 2px solid #6c5ce7;
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
  margin-left: 10px;
`;

const RefreshButton = styled.button`
  background: transparent;
  border: none;
  color: #6c5ce7;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(108, 92, 231, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: #666;
`;

const NewLogIndicator = styled.div`
  background: #6c5ce7;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  animation: pulse 1s infinite;
`;

const LogContainer = styled.div`
  margin-top: 2rem;
  background: linear-gradient(145deg, #ffffff, #f5f0ff);
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(147, 112, 219, 0.08);
  overflow: hidden;
`;

const LogHeader = styled.div`
  padding: 1rem;
  background: white;
  border-bottom: 1px solid rgba(147, 112, 219, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogTitle = styled.h3`
  color: #6c5ce7;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: "📋";
  }
`;

const LogContent = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
  background: white;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(147, 112, 219, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #9370db, #8a2be2);
    border-radius: 3px;
  }
`;

const LogItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.8rem;
  margin-bottom: 0.5rem;
  background: ${(props) => {
    switch (props.type) {
      case "Oluşturma": return "rgba(108, 92, 231, 0.05)";
      case "Hata": return "rgba(255, 99, 99, 0.05)";
      default: return "rgba(147, 112, 219, 0.05)";
    }
  }};
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
  }
`;

const LogTime = styled.span`
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
`;

const LogType = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c5ce7;
  padding: 0.2rem 0.6rem;
  background: rgba(108, 92, 231, 0.1);
  border-radius: 12px;
`;

const LogMessage = styled.span`
  font-size: 0.9rem;
  color: #4a4a4a;
  flex: 1;
`;

const RefreshIndicator = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const LogPanel = () => {
  const [logs, setLogs] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newLogsCount, setNewLogsCount] = useState(0);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const logsData = await logService.getAllLogs();
      
      // Yeni log sayısını hesapla
      const newCount = logsData.length - logs.length;
      if (newCount > 0) {
        setNewLogsCount(newCount);
        // 3 saniye sonra göstergeyi sıfırla
        setTimeout(() => setNewLogsCount(0), 3000);
      }

      setLogs(logsData);
      setLastUpdate(new Date());
      setError(null);
    } catch (error) {
      console.error("Loglar yüklenirken hata:", error);
      setError("Loglar yüklenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }, [logs.length]);

  // İlk yükleme ve otomatik güncelleme
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Her 5 saniyede bir güncelle
    
    return () => clearInterval(interval);
  }, [fetchLogs]);

  return (
    <LogContainer>
      <LogHeader>
        <LogTitle>Sistem Logları</LogTitle>
        <StatusBar>
          {error && <span style={{ color: 'red' }}>{error}</span>}
          {newLogsCount > 0 && (
            <NewLogIndicator>
              {newLogsCount} yeni log
            </NewLogIndicator>
          )}
          <RefreshButton 
            onClick={fetchLogs} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                Yükleniyor
                <LoadingIcon />
              </>
            ) : (
              <>
                Yenile
                <span>🔄</span>
              </>
            )}
          </RefreshButton>
          <span>
            Son güncelleme: {lastUpdate.toLocaleTimeString()}
          </span>
        </StatusBar>
      </LogHeader>
      <LogContent>
        {logs.map((log, index) => (
          <LogItem 
            key={index} 
            type={log.logType}
            style={{
              animation: index < newLogsCount ? 'fadeIn 0.5s ease-in' : 'none'
            }}
          >
            <LogTime>
              {new Date(new Date(log.logDate).getTime() + 3 * 60 * 60 * 1000).toLocaleString("tr-TR")}
            </LogTime>
            <LogType>{log.logType}</LogType>
            <LogMessage>{log.logDetails}</LogMessage>
          </LogItem>
        ))}
        {logs.length === 0 && !isLoading && !error && (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
            Henüz log kaydı bulunmuyor
          </div>
        )}
      </LogContent>
    </LogContainer>
  );
};

export default LogPanel; 