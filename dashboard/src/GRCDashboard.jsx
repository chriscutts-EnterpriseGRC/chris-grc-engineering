import React, { useState, useEffect, useContext, createContext, useRef, useCallback } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Shield, AlertTriangle, TrendingUp, TrendingDown, CheckCircle,
  Grid, Search, Bell, Settings, User, Menu, Activity,
  ArrowUpRight, ArrowDownRight, ChevronRight, Zap, Database,
  Lock, Globe, Eye, RefreshCw, Play, FileText,
  CheckSquare, Bug, Flame, BookOpen, Building2, Cpu,
  Users, Download, Award, BarChart2, X
} from 'lucide-react';
import { api } from './lib/api';
import { isLive } from './lib/supabase';
import { daysFromToday, PRIORITY_NAMES, PRIORITY_COLOR, SLA_DAYS } from './lib/vsrm';