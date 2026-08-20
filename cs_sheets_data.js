// ============================================================
// Striver's (takeUforward) Core CS Sheets Dataset
// Covers: Operating Systems (OS), DBMS, Computer Networks (CN)
// ============================================================

const CS_SHEETS_DATA = (function () {
  const SUBJECTS = [
    { id: "os", name: "Operating Systems", shortName: "OS", color: "teal", icon: "⚙️" },
    { id: "dbms", name: "Database Systems", shortName: "DBMS", color: "amber", icon: "🗄️" },
    { id: "cn", name: "Computer Networks", shortName: "CN", color: "slate", icon: "🌐" }
  ];

  const TOPICS = [
    // ------------------------------------------------------------
    // 1. OPERATING SYSTEMS (OS)
    // ------------------------------------------------------------
    {
      id: "os_process_vs_thread",
      subject: "os",
      category: "Processes & Threads",
      title: "Process vs Thread & Context Switching",
      difficulty: "easy",
      isHighFrequency: true,
      description: "Fundamental differences between processes and threads, PCB, memory isolation, and cost of context switching.",
      keyTakeaways: "Threads share address space, heap, and open files of the parent process, but have private registers and stack.",
      link: "https://takeuforward.org/operating-system/differences-between-a-process-and-a-thread/"
    },
    {
      id: "os_process_states",
      subject: "os",
      category: "Processes & Threads",
      title: "Process Lifecycle & State Transitions",
      difficulty: "easy",
      isHighFrequency: false,
      description: "New, Ready, Running, Waiting/Blocked, Terminated, and Suspended states with CPU scheduling transitions.",
      keyTakeaways: "Understand triggers for Ready to Running (Scheduler dispatch) vs Running to Waiting (I/O wait) vs Preemption.",
      link: "https://takeuforward.org/operating-system/process-states-in-operating-system/"
    },
    {
      id: "os_fork_exec_zombie_orphan",
      subject: "os",
      category: "Processes & Threads",
      title: "Fork(), Exec(), Zombie vs Orphan Processes",
      difficulty: "medium",
      isHighFrequency: true,
      description: "Process creation using fork(), overlaying memory with exec(), handling child termination via wait(), and preventing zombies.",
      keyTakeaways: "Zombie: finished execution but parent hasn't read exit status. Orphan: parent died, adopted by init/systemd (PID 1).",
      link: "https://takeuforward.org/operating-system/zombie-and-orphan-processes-in-c/"
    },
    {
      id: "os_cpu_scheduling",
      subject: "os",
      category: "CPU Scheduling",
      title: "CPU Scheduling Algorithms (FCFS, SJF, Round Robin)",
      difficulty: "medium",
      isHighFrequency: true,
      description: "Preemptive vs Non-preemptive scheduling, Turnaround Time, Waiting Time, Response Time, and Convoy Effect.",
      keyTakeaways: "Round Robin provides optimal response time for time-sharing systems; SJF gives minimal average waiting time.",
      link: "https://takeuforward.org/operating-system/cpu-scheduling-algorithms/"
    },
    {
      id: "os_synchronization_critical_section",
      subject: "os",
      category: "Process Synchronization",
      title: "Critical Section Problem & Synchronization Criteria",
      difficulty: "medium",
      isHighFrequency: true,
      description: "Race conditions, Critical Section requirements: Mutual Exclusion, Progress, and Bounded Waiting.",
      keyTakeaways: "Peterson's algorithm satisfies all 3 conditions for 2 processes in software; hardware uses Test-and-Set / CAS.",
      link: "https://takeuforward.org/operating-system/critical-section-problem/"
    },
    {
      id: "os_mutex_vs_semaphore",
      subject: "os",
      category: "Process Synchronization",
      title: "Mutex vs Binary Semaphore vs Counting Semaphore",
      difficulty: "medium",
      isHighFrequency: true,
      description: "Locking mechanisms, ownership differences, signaling mechanism vs locking, and priority inversion problem.",
      keyTakeaways: "Mutex has ownership (only acquiring thread can release). Semaphore is a signaling construct (value >= 0).",
      link: "https://takeuforward.org/operating-system/mutex-vs-semaphore/"
    },
    {
      id: "os_classic_sync_problems",
      subject: "os",
      category: "Process Synchronization",
      title: "Classic Sync Problems (Producer-Consumer, Dining Philosophers, Reader-Writer)",
      difficulty: "hard",
      isHighFrequency: true,
      description: "Bounded-buffer synchronization with semaphores, avoiding starvation in reader-writer, and deadlock-free dining philosophers.",
      keyTakeaways: "Producer-Consumer uses `empty`, `full` counting semaphores and a binary mutex for buffer isolation.",
      link: "https://takeuforward.org/operating-system/producer-consumer-problem/"
    },
    {
      id: "os_deadlocks_conditions_prevention",
      subject: "os",
      category: "Deadlocks",
      title: "Deadlock: 4 Necessary Conditions & Prevention Strategies",
      difficulty: "medium",
      isHighFrequency: true,
      description: "Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait; techniques to eliminate each condition.",
      keyTakeaways: "Eliminating Circular Wait is most practical: impose total ordering on all resource acquisitions.",
      link: "https://takeuforward.org/operating-system/deadlock-in-operating-system/"
    },
    {
      id: "os_bankers_algorithm",
      subject: "os",
      category: "Deadlocks",
      title: "Banker's Algorithm & Deadlock Avoidance",
      difficulty: "hard",
      isHighFrequency: true,
      description: "Safe state vs Unsafe state, Resource Allocation Graph (RAG), and Banker's Algorithm with Available, Max, Allocation, Need matrices.",
      keyTakeaways: "An unsafe state is not necessarily a deadlock, but every deadlock occurs from an unsafe state.",
      link: "https://takeuforward.org/operating-system/bankers-algorithm-in-operating-system/"
    },
    {
      id: "os_memory_paging_segmentation",
      subject: "os",
      category: "Memory Management",
      title: "Paging, Segmentation & Address Translation",
      difficulty: "medium",
      isHighFrequency: true,
      description: "Logical vs Physical address, Page Tables, Frame Allocation, TLB (Translation Lookaside Buffer), and Internal vs External Fragmentation.",
      keyTakeaways: "Paging eliminates external fragmentation; segmentation preserves programmer view of modular subroutines.",
      link: "https://takeuforward.org/operating-system/paging-in-operating-system/"
    },
    {
      id: "os_virtual_memory_page_replacement",
      subject: "os",
      category: "Memory Management",
      title: "Virtual Memory, Page Faults & Replacement (FIFO, LRU, Optimal)",
      difficulty: "hard",
      isHighFrequency: true,
      description: "Demand paging, Page Fault handling routine, Belady's Anomaly in FIFO, LRU approximation, and Thrashing.",
      keyTakeaways: "Thrashing occurs when CPU spends more time swapping pages than executing instructions; solved with Working Set Model.",
      link: "https://takeuforward.org/operating-system/page-replacement-algorithms-in-operating-system/"
    },
    {
      id: "os_file_systems_disk_scheduling",
      subject: "os",
      category: "File Systems & Storage",
      title: "File Allocation Methods & Disk Scheduling (FCFS, SSTF, SCAN, C-SCAN)",
      difficulty: "easy",
      isHighFrequency: false,
      description: "Inodes, contiguous/indexed/linked allocation, and disk arm movement optimization algorithms.",
      keyTakeaways: "SCAN (Elevator) serves requests in one direction then reverses; C-SCAN returns to start without servicing to provide uniform wait times.",
      link: "https://takeuforward.org/operating-system/disk-scheduling-algorithms/"
    },

    // ------------------------------------------------------------
    // 2. DATABASE MANAGEMENT SYSTEMS (DBMS)
    // ------------------------------------------------------------
    {
      id: "dbms_architecture_vs_file_system",
      subject: "dbms",
      category: "DBMS Architecture & Keys",
      title: "DBMS vs File System & 3-Tier Architecture",
      difficulty: "easy",
      isHighFrequency: true,
      description: "Data redundancy, inconsistency, data isolation, physical/logical data independence, and 3-schema architecture (Internal, Conceptual, External).",
      keyTakeaways: "Logical data independence shields external views from changes in conceptual schema.",
      link: "https://takeuforward.org/dbms/difference-between-file-system-and-dbms/"
    },
    {
      id: "dbms_keys_explained",
      subject: "dbms",
      category: "DBMS Architecture & Keys",
      title: "Super Key, Candidate Key, Primary Key & Foreign Key",
      difficulty: "easy",
      isHighFrequency: true,
      description: "Definitions, differences, minimal super keys, candidate keys selection, surrogate keys, and referential integrity constraints.",
      keyTakeaways: "Primary key is a chosen Candidate Key that cannot accept NULL; foreign key enforces referential integrity.",
      link: "https://takeuforward.org/dbms/keys-in-dbms/"
    },
    {
      id: "dbms_acid_properties",
      subject: "dbms",
      category: "Transactions & Concurrency",
      title: "ACID Properties in Transactions",
      difficulty: "easy",
      isHighFrequency: true,
      description: "Atomicity (all or none), Consistency (integrity constraints), Isolation (concurrent execution isolation), Durability (persistence on commit).",
      keyTakeaways: "Atomicity is handled by Undo logs/Recovery Manager; Isolation is handled by Concurrency Control Manager.",
      link: "https://takeuforward.org/dbms/acid-properties-in-dbms/"
    },
    {
      id: "dbms_normalization_1nf_to_bcnf",
      subject: "dbms",
      category: "Normalization",
      title: "Normalization: 1NF, 2NF, 3NF, and BCNF",
      difficulty: "hard",
      isHighFrequency: true,
      description: "Functional Dependencies (FDs), Partial Dependency elimination (2NF), Transitive Dependency elimination (3NF), and BCNF requirements.",
      keyTakeaways: "In 3NF, for X -> Y, either X is super key OR Y is prime attribute. In BCNF, X must strictly be a super key.",
      link: "https://takeuforward.org/dbms/normalization-in-dbms-1nf-2nf-3nf-bcnf/"
    },
    {
      id: "dbms_transaction_schedules_serializability",
      subject: "dbms",
      category: "Transactions & Concurrency",
      title: "Schedules, Conflict Serializability & Precedence Graph",
      difficulty: "hard",
      isHighFrequency: true,
      description: "Conflict operations (Read-Write, Write-Read, Write-Write on same item), Conflict Equivalence, Precedence Graph cycle detection, and View Serializability.",
      keyTakeaways: "If Precedence Graph has no cycles, the concurrent schedule is conflict serializable and equivalent to a serial schedule.",
      link: "https://takeuforward.org/dbms/concurrency-control-in-dbms/"
    },
    {
      id: "dbms_concurrency_protocols_2pl",
      subject: "dbms",
      category: "Transactions & Concurrency",
      title: "Locking Protocols & Two-Phase Locking (2PL, Strict 2PL)",
      difficulty: "hard",
      isHighFrequency: true,
      description: "Shared (S) vs Exclusive (X) locks, Growing Phase vs Shrinking Phase in 2PL, avoiding cascading rollbacks with Strict/Rigorous 2PL.",
      keyTakeaways: "Basic 2PL guarantees conflict serializability but may suffer from deadlocks; Strict 2PL prevents cascading aborts.",
      link: "https://takeuforward.org/dbms/two-phase-locking-protocol-in-dbms/"
    },
    {
      id: "dbms_indexing_b_trees",
      subject: "dbms",
      category: "Indexing & Storage",
      title: "Indexing: Clustered vs Non-Clustered & B/B+ Trees",
      difficulty: "medium",
      isHighFrequency: true,
      description: "Dense vs Sparse index, Primary vs Secondary index, Clustered index determining physical order, B+ Tree structure with linked leaf nodes for range queries.",
      keyTakeaways: "A table can only have 1 clustered index because rows can only be stored in one physical order.",
      link: "https://takeuforward.org/dbms/indexing-in-databases/"
    },
    {
      id: "dbms_sql_joins_subqueries",
      subject: "dbms",
      category: "SQL & Querying",
      title: "SQL Joins (Inner, Left, Right, Full, Cross, Self) & Window Functions",
      difficulty: "medium",
      isHighFrequency: true,
      description: "All types of joins, correlated vs non-correlated subqueries, GROUP BY vs HAVING, and window functions (ROW_NUMBER, RANK, DENSE_RANK).",
      keyTakeaways: "WHERE filters rows before aggregation; HAVING filters groups after GROUP BY aggregation.",
      link: "https://takeuforward.org/dbms/sql-joins-with-examples/"
    },
    {
      id: "dbms_sql_vs_nosql_cap_theorem",
      subject: "dbms",
      category: "Modern Databases",
      title: "SQL vs NoSQL Databases & CAP Theorem",
      difficulty: "medium",
      isHighFrequency: true,
      description: "Relational vs Document/Key-Value/Columnar/Graph stores, Horizontal vs Vertical scaling, and CAP Theorem (Consistency, Availability, Partition Tolerance).",
      keyTakeaways: "In network partitions (P), distributed systems must trade off Consistency (CP like MongoDB/HBase) vs Availability (AP like Cassandra/DynamoDB).",
      link: "https://takeuforward.org/dbms/difference-between-sql-and-nosql/"
    },
    {
      id: "dbms_views_triggers_stored_procedures",
      subject: "dbms",
      category: "SQL & Querying",
      title: "Views, Triggers, Stored Procedures & Cursors",
      difficulty: "easy",
      isHighFrequency: false,
      description: "Virtual tables, automated event-driven triggers (BEFORE/AFTER INSERT/UPDATE/DELETE), compiled stored procedures, and row-by-row cursors.",
      keyTakeaways: "Views enhance security by restricting column access without copying physical data.",
      link: "https://takeuforward.org/dbms/views-and-triggers-in-sql/"
    },

    // ------------------------------------------------------------
    // 3. COMPUTER NETWORKS (CN)
    // ------------------------------------------------------------
    {
      id: "cn_osi_vs_tcp_ip_models",
      subject: "cn",
      category: "Network Models & Architecture",
      title: "OSI 7-Layer vs TCP/IP Protocol Stack",
      difficulty: "easy",
      isHighFrequency: true,
      description: "Physical, Data Link, Network, Transport, Session, Presentation, Application layers, PDUs (Bit, Frame, Packet, Segment, Data), and encapsulation.",
      keyTakeaways: "Data Link works with MAC addresses (hop-to-hop); Network works with IP addresses (host-to-host); Transport works with ports (process-to-process).",
      link: "https://takeuforward.org/computer-network/osi-model-in-computer-networks/"
    },
    {
      id: "cn_tcp_vs_udp",
      subject: "cn",
      category: "Transport Layer",
      title: "TCP vs UDP: In-Depth Comparison",
      difficulty: "easy",
      isHighFrequency: true,
      description: "Connection-oriented vs Connectionless, reliable ordered delivery vs low latency best-effort, header size (20-60B vs 8B), and use-cases.",
      keyTakeaways: "TCP guarantees delivery via ACKs & retransmissions; UDP is preferred for real-time gaming, VoIP, DNS, and video streaming.",
      link: "https://takeuforward.org/computer-network/difference-between-tcp-and-udp/"
    },
    {
      id: "cn_tcp_handshake_termination",
      subject: "cn",
      category: "Transport Layer",
      title: "TCP 3-Way Handshake & 4-Way Connection Teardown",
      difficulty: "medium",
      isHighFrequency: true,
      description: "SYN, SYN-ACK, ACK sequence numbers, ISN generation, FIN, ACK handshake for closing, and TIME_WAIT state purpose (2MSL).",
      keyTakeaways: "TIME_WAIT ensures lingering duplicate packets expire and that the final ACK was received by the remote endpoint.",
      link: "https://takeuforward.org/computer-network/tcp-3-way-handshake-process/"
    },
    {
      id: "cn_tcp_flow_congestion_control",
      subject: "cn",
      category: "Transport Layer",
      title: "TCP Flow Control (Sliding Window) & Congestion Control",
      difficulty: "hard",
      isHighFrequency: true,
      description: "Receiver Advertised Window (rwnd), Congestion Window (cwnd), Slow Start, Congestion Avoidance, Fast Retransmit (3 duplicate ACKs), and Fast Recovery.",
      keyTakeaways: "Effective transmission window = min(rwnd, cwnd). AIMD (Additive Increase Multiplicative Decrease) maintains fairness.",
      link: "https://takeuforward.org/computer-network/tcp-congestion-control/"
    },
    {
      id: "cn_ip_addressing_subnetting_cidr",
      subject: "cn",
      category: "Network Layer",
      title: "IPv4 vs IPv6, Subnetting & CIDR Calculation",
      difficulty: "medium",
      isHighFrequency: true,
      description: "Classful addressing (A, B, C, D, E), CIDR notation (/24, /28), subnet masks, calculating network ID, broadcast IP, and usable host count.",
      keyTakeaways: "Usable hosts per subnet = 2^(32 - prefix) - 2 (subtracting Network Address and Directed Broadcast Address).",
      link: "https://takeuforward.org/computer-network/subnetting-in-computer-networks/"
    },
    {
      id: "cn_dns_resolution_process",
      subject: "cn",
      category: "Application Layer & Web",
      title: "DNS Architecture & Full Resolution Flow",
      difficulty: "medium",
      isHighFrequency: true,
      description: "Domain hierarchy, Recursive vs Iterative resolvers, Root Servers, TLD Servers, Authoritative DNS, DNS record types (A, AAAA, CNAME, MX, TXT), and caching.",
      keyTakeaways: "Resolution flow: Browser Cache -> OS Cache -> Recursive Resolver -> Root Nameserver -> TLD Nameserver -> Authoritative Nameserver.",
      link: "https://takeuforward.org/computer-network/domain-name-system-dns-in-computer-network/"
    },
    {
      id: "cn_http_https_ssl_tls",
      subject: "cn",
      category: "Application Layer & Web",
      title: "HTTP vs HTTPS, HTTP/1.1 vs HTTP/2/3 & TLS Handshake",
      difficulty: "medium",
      isHighFrequency: true,
      description: "HTTP status codes, persistent connections, multiplexing, SSL/TLS asymmetric certificate exchange, symmetric session key negotiation, and QUIC (UDP-based HTTP/3).",
      keyTakeaways: "HTTPS encrypts the HTTP payload using TLS. Asymmetric crypto is used during handshake; symmetric crypto is used for bulk data transfer.",
      link: "https://takeuforward.org/computer-network/difference-between-http-and-https/"
    },
    {
      id: "cn_arp_rarp_mac_ip",
      subject: "cn",
      category: "Data Link & Network Layer",
      title: "ARP, RARP & MAC Address vs IP Address",
      difficulty: "easy",
      isHighFrequency: true,
      description: "Address Resolution Protocol (IP to MAC translation), broadcast request, unicast reply, ARP cache poisoning, and Proxy ARP.",
      keyTakeaways: "ARP operates at Network/Data-Link boundary to find the physical hardware address for local network transmission.",
      link: "https://takeuforward.org/computer-network/address-resolution-protocol-arp/"
    },
    {
      id: "cn_routing_algorithms",
      subject: "cn",
      category: "Network Layer",
      title: "Routing Protocols (Distance Vector, Link State, OSPF, BGP)",
      difficulty: "hard",
      isHighFrequency: false,
      description: "Intra-domain vs Inter-domain routing, Bellman-Ford in RIP (Count to Infinity problem), Dijkstra in OSPF, and Path Vector protocol in BGP for internet peering.",
      keyTakeaways: "Link State routers broadcast link information to all nodes; Distance Vector routers only share routing tables with immediate neighbors.",
      link: "https://takeuforward.org/computer-network/routing-algorithms-in-computer-networks/"
    },
    {
      id: "cn_network_security_basics",
      subject: "cn",
      category: "Security & Protocols",
      title: "Firewalls, Symmetric vs Asymmetric Encryption, VPN & DDoS",
      difficulty: "medium",
      isHighFrequency: true,
      description: "Stateful vs stateless packet inspection firewalls, AES/RSA cryptography, Digital Signatures, VPN tunneling, and DDoS attack mitigation (SYN flood, DNS amplification).",
      keyTakeaways: "Digital signatures provide Authentication, Non-repudiation, and Integrity by signing hashes with sender's private key.",
      link: "https://takeuforward.org/computer-network/network-security-basics/"
    }
  ];

  function getSubjects() {
    return SUBJECTS;
  }

  function getAllTopics() {
    return TOPICS;
  }

  function getTopicsBySubject(subjectId) {
    if (!subjectId || subjectId === "all") return TOPICS;
    return TOPICS.filter(function (t) { return t.subject === subjectId; });
  }

  function getTopicById(id) {
    return TOPICS.find(function (t) { return t.id === id; }) || null;
  }

  return {
    getSubjects: getSubjects,
    getAllTopics: getAllTopics,
    getTopicsBySubject: getTopicsBySubject,
    getTopicById: getTopicById
  };
})();
