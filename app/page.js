'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useEffect, useState } from 'react'
import { paymentAPI } from '@/lib/api'

export default function HomePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [gameProviders, setGameProviders] = useState([])
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true)
  const [loadingProviders, setLoadingProviders] = useState(true)

  // Default payment methods fallback (with proper logos)
  const defaultPaymentMethods = [
    { id: 'papara', name: 'Papara', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrUOWIw-W1huRgXhguTyN9rXCVw-1rQqWcmcb5Kb9qURdaMi2B-4k6WdQJlltVW8HJaBz_kBD5l93hKYoeMVgHM13a4EAIEWQDidbhEHah4jXewTtIxb9zZeOIBJ7r0rpQdHTAI8ol0cSKRvx84dYjhDlEBCWIuTfrW0RFQUOSA43iOSOUJhiLTZWqpvdWwg64zg3Q6bWKTouX77aKaOtVhx34KZH9-tcY9KLsLCeen4hAr3fE-b08WysDtEIuApiJ9gr9LLZ5USM', min: '200₺', available: true },
    { id: 'jeton', name: 'Jeton', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBv96O1SbNqWATvQvL9l61h0u8wOp57jNAjFSVQAFYTrTo2HZqp6TzeA-RsvY9IBMO2jmezGHNDg0r0UBGKTozMLIkXQZo4k89DDK4R925SzIBZoX7IFIfWPM9y85U-DzzJHmvdJSwsq4XgxZ5_FpWKPD-vhK4WIz3UbvBrkOCVke5Wp8jlFJ9JdF_vAvWuMMG1OIrluFqn59xjqYgcApwSTwURRkPJmbWN1HEunMVTTwljV0qeTacLthvGA5ZeesL-OomL8hHzrcs', min: '200₺', available: true },
    { id: 'payfix', name: 'Payfix', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRLnCRDbvF49AdXxAytYRof2OBbII4_iVQGoCJJQG-KSAPj__dGcqYXdW4RSsKISR1NEcyxIGYb_rMuR8AnLwSN4GGNm0da23s9F61Tw24Oa1pnmctKIZe_3NGTkz8waCrbqBXJoHdTxWCN4kwrLFqYUdOEbCwXQBNhhkeWpHzckt8gqLEGh6uApxucdhfzlILsqTAYUae46wc2MGsbm6GI7YXSv_OtOtha68q_Ls4z4jI-pAqhFKocJFT0UA6QcLTfdw1sNJjQy4', min: '25₺', available: true },
    { id: 'aninda-papara', name: 'Aninda Papara', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrUOWIw-W1huRgXhguTyN9rXCVw-1rQqWcmcb5Kb9qURdaMi2B-4k6WdQJlltVW8HJaBz_kBD5l93hKYoeMVgHM13a4EAIEWQDidbhEHah4jXewTtIxb9zZeOIBJ7r0rpQdHTAI8ol0cSKRvx84dYjhDlEBCWIuTfrW0RFQUOSA43iOSOUJhiLTZWqpvdWwg64zg3Q6bWKTouX77aKaOtVhx34KZH9-tcY9KLsLCeen4hAr3fE-b08WysDtEIuApiJ9gr9LLZ5USM', min: '1₺', available: true },
    { id: 'hizli-papara', name: 'Hizli Papara', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrUOWIw-W1huRgXhguTyN9rXCVw-1rQqWcmcb5Kb9qURdaMi2B-4k6WdQJlltVW8HJaBz_kBD5l93hKYoeMVgHM13a4EAIEWQDidbhEHah4jXewTtIxb9zZeOIBJ7r0rpQdHTAI8ol0cSKRvx84dYjhDlEBCWIuTfrW0RFQUOSA43iOSOUJhiLTZWqpvdWwg64zg3Q6bWKTouX77aKaOtVhx34KZH9-tcY9KLsLCeen4hAr3fE-b08WysDtEIuApiJ9gr9LLZ5USM', min: '50₺', available: true },
    { id: 'aninda-havale', name: 'Aninda Havale', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRLnCRDbvF49AdXxAytYRof2OBbII4_iVQGoCJJQG-KSAPj__dGcqYXdW4RSsKISR1NEcyxIGYb_rMuR8AnLwSN4GGNm0da23s9F61Tw24Oa1pnmctKIZe_3NGTkz8waCrbqBXJoHdTxWCN4kwrLFqYUdOEbCwXQBNhhkeWpHzckt8gqLEGh6uApxucdhfzlILsqTAYUae46wc2MGsbm6GI7YXSv_OtOtha68q_Ls4z4jI-pAqhFKocJFT0UA6QcLTfdw1sNJjQy4', min: '250₺', available: true },
    { id: 'banka-havalesi', name: 'Banka Havalesi', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRLnCRDbvF49AdXxAytYRof2OBbII4_iVQGoCJJQG-KSAPj__dGcqYXdW4RSsKISR1NEcyxIGYb_rMuR8AnLwSN4GGNm0da23s9F61Tw24Oa1pnmctKIZe_3NGTkz8waCrbqBXJoHdTxWCN4kwrLFqYUdOEbCwXQBNhhkeWpHzckt8gqLEGh6uApxucdhfzlILsqTAYUae46wc2MGsbm6GI7YXSv_OtOtha68q_Ls4z4jI-pAqhFKocJFT0UA6QcLTfdw1sNJjQy4', min: '250₺', available: true },
    { id: 'mefete', name: 'MEFETE', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_QZPkcEwRgV2w29ueS8OBBJfim6_mPkVEjpxC1ArE5gg38siNYQu9zatW3xQjjNXElC6uaSnT_8wzIShR_bjRBdeN-JkpkWeV_pjXHkGH1ZrDibNf247kJoP-9QxR0QA2Zy2gIg0n4G_WqK1OUPjC3hnz9LRT4IhgBT0GTfkudTS38lm8peLtaiDaRCyiiGd2INgtFLy74hcenW-Fs65OXDh_-ICby-tcDeKe-KXlRyigL3OeYYWHGR6K31Z7sv189tPfFbglRtg', min: '20₺', available: true },
  ]

  // Default game providers fallback
  const defaultGameProviders = [
    { id: 'pragmatic-play', name: 'Pragmatic Play', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3kwS4yyM7hQZ4Qf9EzLOPpWlojJppui1Gjv9a8q7EmCAYfGxS8LaMn9jRpKLwbcLY-BQ40DHVnaElyo7jHY0DE7v3V16kzdakcyLADBsAtCc8Jmaheg9ntYoYtCOexD_c2vltciWwFicWGdUlexOkhYB0wVz2iIY5dnXH04gxrUc9QiYDJ-_vyVGWEwaTN7mKGduSQ71r2iMfmXrAPrN7JMnnfiQrOZPoB9z3oIsrk1PxcoK9hp6iLP7jb6DBkgcxo-XSMUoIxUk', available: true },
    { id: 'amusnet', name: 'Amusnet', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPXSfIOH2zDcB7mCKHsxEv2BqCSqiSAt9_dfPw0cDd5c-zBHS8KCKOetJL2qg-DOZgoXz7_UuMNf3YQj8vquRCHLk5XP_6-PsSJawl2-gOd5Le_-NizI_uNGSS6SWPbGnB5zh2xm4sCp2KwTVwnSEE8ytIkWZaQNwFlf5ScG9vgymq4RVKzpdowc0sTSJ4IyddWme_fTE4m2iu5-Jg4rzgK58OQM8Ck9ZqyBRuyIMGFHEVwb0TvRtwmyFAQ2eFoxpqX1eBxwX5xBk', available: true },
    { id: 'egt-digital', name: 'EGT Digital', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrUOWIw-W1huRgXhguTyN9rXCVw-1rQqWcmcb5Kb9qURdaMi2B-4k6WdQJlltVW8HJaBz_kBD5l93hKYoeMVgHM13a4EAIEWQDidbhEHah4jXewTtIxb9zZeOIBJ7r0rpQdHTAI8ol0cSKRvx84dYjhDlEBCWIuTfrW0RFQUOSA43iOSOUJhiLTZWqpvdWwg64zg3Q6bWKTouX77aKaOtVhx34KZH9-tcY9KLsLCeen4hAr3fE-b08WysDtEIuApiJ9gr9LLZ5USM', available: true },
    { id: 'hacksaw-gaming', name: 'Hacksaw Gaming', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRLnCRDbvF49AdXxAytYRof2OBbII4_iVQGoCJJQG-KSAPj__dGcqYXdW4RSsKISR1NEcyxIGYb_rMuR8AnLwSN4GGNm0da23s9F61Tw24Oa1pnmctKIZe_3NGTkz8waCrbqBXJoHdTxWCN4kwrLFqYUdOEbCwXQBNhhkeWpHzckt8gqLEGh6uApxucdhfzlILsqTAYUae46wc2MGsbm6GI7YXSv_OtOtha68q_Ls4z4jI-pAqhFKocJFT0UA6QcLTfdw1sNJjQy4', available: true },
    { id: 'evolution', name: 'Evolution', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLViOFoCPPyIH92cUFJxjd9eQ7OK5lhwvXpJOVIaGjRgLOVhlBop6EC2HJaRfysVcPbHIfIH5QAbLMAaAjks3vJXhnTucNrRTPCkBOHiqy9jKVCE5y9Oa2d7yOM2bKr0YdSG1ivRPKfmMMTERUWiOLWh0HMIxWDPq8LFtaArBJHZuNdLfuyf4FRGIzh6o5OmY1wNghWYSRHQvjE4T-3gt8caWVEasL_BJFrJ4YYBNWC81GTl_hbJvur6q9C1Q5-erfmJ5Aufi8uxE', available: true },
    { id: 'ezugi', name: 'Ezugi', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBA2VZQxDW8ohkuCpe0yXlCQ-WwyzFV_0UgNWe0q6-d-mFqS9IYxLNVYGP1l0ZgF_OsK7WbSTKvP6-rMGb36qMLsQF4RtFA9-fuQhXzgeMCoK5P7JwObTL7C--5K4RI5icxiJdWQW9_97lU1em5U6-V4KTzcXpJbAaXf2pm-P7EMXgUao6CpbOZboJ2s1vFF8onp_HfRatKgjBfjynB76i8xmHfoWmyvOYUnLl8QWLw1rYAlrgEW1GMx2I-XPZhk5bhzzUqbQ54DmY', available: true },
  ]

  // Fetch payment methods dynamically
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await paymentAPI.getDepositMethods()
        const methods = response.data?.methods || response.data || []
        
        // Map API response to our format, preserving logos
        const mappedMethods = methods.map(method => {
          // Find matching default method to preserve logo
          const defaultMethod = defaultPaymentMethods.find(d => 
            d.id === method.id || 
            d.name.toLowerCase() === method.name?.toLowerCase() ||
            (method.nameEn && d.name.toLowerCase() === method.nameEn.toLowerCase())
          )
          
          return {
            id: method.id || method.name?.toLowerCase().replace(/\s+/g, '-'),
            name: method.name || method.nameEn || 'Unknown',
            logo: method.image || defaultMethod?.logo || 'https://via.placeholder.com/150',
            min: method.min || '100₺',
            available: method.available !== false,
          }
        })
        
        // If API returns methods, use them; otherwise use defaults
        setPaymentMethods(mappedMethods.length > 0 ? mappedMethods : defaultPaymentMethods)
      } catch (error) {
        console.error('Failed to fetch payment methods:', error)
        // Use default methods on error
        setPaymentMethods(defaultPaymentMethods)
      } finally {
        setLoadingPaymentMethods(false)
      }
    }

    fetchPaymentMethods()
  }, [])

  // Fetch game providers (using defaults for now since no public API exists)
  useEffect(() => {
    // Simulate API call delay for better UX
    setTimeout(() => {
      setGameProviders(defaultGameProviders)
      setLoadingProviders(false)
    }, 300)
  }, [])

  useEffect(() => {
    setIsVisible(true)
    
    // Enhanced scroll animation observer with stagger effect
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible')
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translateY(0)'
          }, index * 50)
        }
      })
    }, observerOptions)
    
    const elements = document.querySelectorAll('.fade-in-on-scroll, .stagger-item')
    elements.forEach(el => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(30px)'
      el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'
      observer.observe(el)
    })
    
    return () => {
      elements.forEach(el => observer.unobserve(el))
    }
  }, [])

  const gameCategories = [
    { title: 'SPOR BAHİSLERİ', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJFdt_egz5gHLlu-FTOvLZ6GGptOc1EJj71POiCjeDrnMJjkzMvosLXXgK5hUf531IsvMXp6RHYJ_UG6va5bWKdRw7cipUb2LpBgEYuCbIw8YzVmblbTkKs1cjRkNEdU52NUIc1soBkGcFx5u_RvSBouV9UJ5Lj0hirahoJTQHTQk5JMYK77pvjnIFdGy3Yfzo-pZLkCFGgUDmsaW4SdPst-LML4p1l7bymtZx_-CR08BXhFn8aK0aM1oIqjCr-F4NoFFC2wYqaZI' },
    { title: 'CANLI CASINO', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLViOFoCPPyIH92cUFJxjd9eQ7OK5lhwvXpJOVIaGjRgLOVhlBop6EC2HJaRfysVcPbHIfIH5QAbLMAaAjks3vJXhnTucNrRTPCkBOHiqy9jKVCE5y9Oa2d7yOM2bKr0YdSG1ivRPKfmMMTERUWiOLWh0HMIxWDPq8LFtaArBJHZuNdLfuyf4FRGIzh6o5OmY1wNghWYSRHQvjE4T-3gt8caWVEasL_BJFrJ4YYBNWC81GTl_hbJvur6q9C1Q5-erfmJ5Aufi8uxE' },
    { title: 'SLOT OYUNLARI', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8qmSEpnangbZPsEjVrL4-T_QPnQkwNw-hEeOmBbriCBPZ0rAdek9_QXP3OxhpJ4TT1Vv-sFc9RtkrNVz9okC-aMPyaeFOghAFXTt0ggedS8eftCzprVzWRuleHIcF8813i6rAJ1Ef8s0yzVx3TbeeaVLXcLBvLkt-jpxGRC4e7fSDs-pKcyTVXvmCSqAqkKGxFsznPC_WtVn-pl4HY-lYn6vFERfeOA4G3uX_-npkmhkZ8b242jMomzQMvGI35c1jqJFlNcMCqCY' },
    { title: 'SANAL SPORLAR', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjPNLqQFPxRhlnwXsXC31ZpGayc1URQmJHAaKr6iVluWvhIARqkjLtDSu0eXi8SMabkf3FiWO2qwjEwPmWJUjY_wjlFpFXr55SvTDz_eV3LaZ6arpNvKYFAhb9OZSOtKsxyiC-tY3VJI9PuGw8TeDIJe4hLUHNLwypPvCMbicRAn49H03QwEOaEvJZ1TzxqjZ2dPT7wSgMYZhSZlBGG1szQ9c0dFP5Z6nwgbNE1CXVAVdvXa2b0rzPf1npQqAypXFeW1SWa1rrNJU' },
    { title: 'CRASH OYUNLARI', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgxL1mseMlK2-RLOjovS4IIJ0pwn3Nvdm_yIiJltXUeUrWycM84O2-syNPpKZ4QoyXyLmqRmsdts_-Crvliv3zi5_DabbcAGW5_i1oZTRAFUKy0FJDHiNsM_XDdwAiCKz-VTEVjK6IL4_eHbK1Uavg71T2aS7BRPUiKr6ylEEvKe4jpgb3TauZzHWPFju1QBLhy49KoC5l67zEAZdYC3GMcDvMatAW3YSX79vAwNP6NgkW-l-NOj4a4xZZvm7eCwS7W4kF42-dDTA' },
  ]

  // Updated trending games with casino/gaming style images (matching game categories format)
  const trendingGames = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCgxL1mseMlK2-RLOjovS4IIJ0pwn3Nvdm_yIiJltXUeUrWycM84O2-syNPpKZ4QoyXyLmqRmsdts_-Crvliv3zi5_DabbcAGW5_i1oZTRAFUKy0FJDHiNsM_XDdwAiCKz-VTEVjK6IL4_eHbK1Uavg71T2aS7BRPUiKr6ylEEvKe4jpgb3TauZzHWPFju1QBLhy49KoC5l67zEAZdYC3GMcDvMatAW3YSX79vAwNP6NgkW-l-NOj4a4xZZvm7eCwS7W4kF42-dDTA',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA8qmSEpnangbZPsEjVrL4-T_QPnQkwNw-hEeOmBbriCBPZ0rAdek9_QXP3OxhpJ4TT1Vv-sFc9RtkrNVz9okC-aMPyaeFOghAFXTt0ggedS8eftCzprVzWRuleHIcF8813i6rAJ1Ef8s0yzVx3TbeeaVLXcLBvLkt-jpxGRC4e7fSDs-pKcyTVXvmCSqAqkKGxFsznPC_WtVn-pl4HY-lYn6vFERfeOA4G3uX_-npkmhkZ8b242jMomzQMvGI35c1jqJFlNcMCqCY',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBNWaCaCf4c9Drk0eLzT_NxjtLxoAc6cJZKa8ouzrfcHv9rGAkEWplyTFgpWnmb76nxq203ofQT91RX0IVmi7KTJQIOo67bg28rUiDtClodMGuK-ejlGFgP3fW4kEpp53NhodsjlaoMIhtuj5LvpvN6yEIAfX2NMb0X5rxiLrMGhAUL4RKXo4agx8c-M7lY_30e9-C2J8Vmgt_lVKfnVF-aVHmJC6zPSxKb0Pn93x_ptBIFPvid2O6EFafRct1JEkt5b9JMlMJ1b8U',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBA2VZQxDW8ohkuCpe0yXlCQ-WwyzFV_0UgNWe0q6-d-mFqS9IYxLNVYGP1l0ZgF_OsK7WbSTKvP6-rMGb36qMLsQF4RtFA9-fuQhXzgeMCoK5P7JwObTL7C--5K4RI5icxiJdWQW9_97lU1em5U6-V4KTzcXpJbAaXf2pm-P7EMXgUao6CpbOZboJ2s1vFF8onp_HfRatKgjBfjynB76i8xmHfoWmyvOYUnLl8QWLw1rYAlrgEW1GMx2I-XPZhk5bhzzUqbQ54DmY',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCLViOFoCPPyIH92cUFJxjd9eQ7OK5lhwvXpJOVIaGjRgLOVhlBop6EC2HJaRfysVcPbHIfIH5QAbLMAaAjks3vJXhnTucNrRTPCkBOHiqy9jKVCE5y9Oa2d7yOM2bKr0YdSG1ivRPKfmMMTERUWiOLWh0HMIxWDPq8LFtaArBJHZuNdLfuyf4FRGIzh6o5OmY1wNghWYSRHQvjE4T-3gt8caWVEasL_BJFrJ4YYBNWC81GTl_hbJvur6q9C1Q5-erfmJ5Aufi8uxE',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDJFdt_egz5gHLlu-FTOvLZ6GGptOc1EJj71POiCjeDrnMJjkzMvosLXXgK5hUf531IsvMXp6RHYJ_UG6va5bWKdRw7cipUb2LpBgEYuCbIw8YzVmblbTkKs1cjRkNEdU52NUIc1soBkGcFx5u_RvSBouV9UJ5Lj0hirahoJTQHTQk5JMYK77pvjnIFdGy3Yfzo-pZLkCFGgUDmsaW4SdPst-LML4p1l7bymtZx_-CR08BXhFn8aK0aM1oIqjCr-F4NoFFC2wYqaZI',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBjPNLqQFPxRhlnwXsXC31ZpGayc1URQmJHAaKr6iVluWvhIARqkjLtDSu0eXi8SMabkf3FiWO2qwjEwPmWJUjY_wjlFpFXr55SvTDz_eV3LaZ6arpNvKYFAhb9OZSOtKsxyiC-tY3VJI9PuGw8TeDIJe4hLUHNLwypPvCMbicRAn49H03QwEOaEvJZ1TzxqjZ2dPT7wSgMYZhSZlBGG1szQ9c0dFP5Z6nwgbNE1CXVAVdvXa2b0rzPf1npQqAypXFeW1SWa1rrNJU',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCPXSfIOH2zDcB7mCKHsxEv2BqCSqiSAt9_dfPw0cDd5c-zBHS8KCKOetJL2qg-DOZgoXz7_UuMNf3YQj8vquRCHLk5XP_6-PsSJawl2-gOd5Le_-NizI_uNGSS6SWPbGnB5zh2xm4sCp2KwTVwnSEE8ytIkWZaQNwFlf5ScG9vgymq4RVKzpdowc0sTSJ4IyddWme_fTE4m2iu5-Jg4rzgK58OQM8Ck9ZqyBRuyIMGFHEVwb0TvRtwmyFAQ2eFoxpqX1eBxwX5xBk',
  ]

  // Static statistics data
  const statistics = [
    { label: 'Aktif Oyuncu', value: '125,00+', icon: '👥' },
    { label: 'Günlük Bahis', value: '1.2M+', icon: '💰' },
    { label: 'Oyun Çeşidi', value: '50,0+', icon: '🎮' },
    { label: 'Canlı Maç', value: '150+', icon: '⚽' },
    
  ]

  // Static features data
  const features = [
    { 
      title: 'Hızlı Ödemeler', 
      description: '7/24 anında para çekme imkanı',
      icon: '⚡',
      color: 'from-yellow-500/20 to-orange-500/20'
    },
    { 
      title: 'Güvenli Platform', 
      description: 'SSL şifreleme ile korumalı',
      icon: '🔒',
      color: 'from-green-500/20 to-emerald-500/20'
    },
    { 
      title: 'Canlı Destek', 
      description: '24 saat kesintisiz müşteri hizmetleri',
      icon: '💬',
      color: 'from-blue-500/20 to-cyan-500/20'
    },
    { 
      title: 'Mobil Uyumlu', 
      description: 'Tüm cihazlarda sorunsuz deneyim',
      icon: '📱',
      color: 'from-purple-500/20 to-pink-500/20'
    },
  ]

  // Static sports matches data
  const staticMatches = [
    {
      date: '19 KASIM',
      time: '23:00',
      team1: 'ARSENAL (W)',
      team2: 'REAL MADRID (W)',
      league: 'Champions League - KADINLAR $.LIGI',
      odds: { home: '1.55', draw: '3.85', away: '4.83' }
    },
    {
      date: '20 KASIM',
      time: '20:00',
      team1: 'FK Anda Kencifali',
      team2: 'CSKA 1948 Sofia',
      league: 'Champions League - KADINLAR $.LIGI',
      odds: { home: '2.14', draw: '3.04', away: '2.12' }
    },
    {
      date: '20 KASIM',
      time: '22:30',
      team1: 'BARCELONA',
      team2: 'MANCHESTER CITY',
      league: 'UEFA Champions League',
      odds: { home: '1.85', draw: '3.40', away: '4.20' }
    },
    {
      date: '21 KASIM',
      time: '19:45',
      team1: 'BAYERN MUNICH',
      team2: 'PSG',
      league: 'UEFA Champions League',
      odds: { home: '2.10', draw: '3.25', away: '3.50' }
    },
  ]

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-[#151328]">
      <div className="layout-container flex h-full grow flex-col w-full">
        <div className="flex flex-1 justify-center w-full">
          <div className="layout-content-container flex flex-col w-full max-w-7xl flex-1 mx-auto">
            <Navbar />
  
            <main className="flex-1 w-full">
              {/* Hero Banner */}
              <div className="px-4 sm:px-6 lg:px-8 py-10 fade-in-on-scroll">
                <div
                  className="flex min-h-[460px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-lg items-start justify-center p-8 md:p-12 text-left relative overflow-hidden card-hover border border-white/10 transform transition-all duration-700 hover:scale-[1.02]"
                  style={{
                    backgroundImage: `linear-gradient(90deg, rgba(21, 19, 40, 0.9) 0%, rgba(21, 19, 40, 0.1) 100%), url("./banner.jpg")`,
                  }}
                >
                  {/* Animated background overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0dccf2]/10 via-[#9333ea]/10 to-[#0dccf2]/10 bg-[length:200%_100%] animate-gradient-shift opacity-50"></div>
                  
                  {/* Floating particles effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.5}s`,
                          animationDuration: `${3 + Math.random() * 2}s`
                        }}
                      />
                    ))}
                  </div>
  
                  <div className="flex flex-col gap-4 max-w-md relative z-10 transform transition-all duration-500 hover:translate-x-2">
                    <p className="text-white text-sm font-bold uppercase tracking-widest animate-slide-up text-shadow-glow transform transition-all duration-300 hover:scale-105">{t('home.superPartnership')}</p>
                    <h1 className="text-white text-5xl font-black leading-tight tracking-[-0.033em] gradient-text animate-slide-up transform transition-all duration-500 hover:scale-105" style={{ animationDelay: '0.2s' }}>
                      {t('home.earningsOpportunity')}
                    </h1>
                    <button
                      onClick={() => router.push('/promotions')}
                      className="flex min-w-[84px] max-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 px-5 bg-white text-black text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-200 transition-all duration-300 hover:scale-110 shadow-glow hover:shadow-glow-lg btn-glow relative animate-slide-up transform hover:-translate-y-1"
                      style={{ animationDelay: '0.4s' }}
                    >
                      <span className="truncate relative z-10">{t('home.details')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistics Section */}
              <div className="px-4 sm:px-6 lg:px-8 py-10 fade-in-on-scroll">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {statistics.map((stat, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-br from-[#1f1d37] to-[#2a2542] border border-white/10 card-hover glass hover:scale-110 transition-all duration-500 ease-out transform hover:-translate-y-2 stagger-item relative overflow-hidden group"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Animated background shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                      
                      <div className="text-4xl mb-3 transform transition-all duration-300 group-hover:scale-125 group-hover:rotate-12">{stat.icon}</div>
                      <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0dccf2] to-[#9333ea] mb-2 transform transition-all duration-300 group-hover:scale-110">
                        {stat.value}
                      </div>
                      <div className="text-white text-sm font-semibold transform transition-all duration-300 group-hover:text-white group-hover:scale-105">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features Section */}
              <div className="px-4 sm:px-6 lg:px-8 py-10 fade-in-on-scroll">
                <h2 className="text-white text-2xl font-bold mb-6 text-gradient transform transition-all duration-300 hover:scale-105">Neden Bizi Seçmelisiniz?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className={`flex flex-col p-6 rounded-lg bg-gradient-to-br ${feature.color} border border-white/10 card-hover glass hover:scale-105 transition-all duration-500 ease-out transform hover:-translate-y-2 stagger-item relative overflow-hidden group`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Pulse effect on hover */}
                      <div className="absolute inset-0 rounded-lg border-2 border-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
                      
                      <div className="text-4xl mb-4 transform transition-all duration-500 group-hover:scale-125 group-hover:rotate-12">{feature.icon}</div>
                      <h3 className="text-white text-lg font-bold mb-2 transform transition-all duration-300 group-hover:translate-x-2 group-hover:text-yellow-300">{feature.title}</h3>
                      <p className="text-white/90 text-sm font-medium transform transition-all duration-300 group-hover:text-white">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
  
            

              {/* Featured Games - Enhanced with Static Data */}
              <div className="px-4 sm:px-6 lg:px-8 py-10 fade-in-on-scroll">
                <h2 className="text-white text-2xl font-bold mb-6 text-gradient transform transition-all duration-300 hover:scale-105">{t('home.featuredGames')}</h2>
                <div className="space-y-4">
                  {staticMatches.map((match, matchIndex) => (
                    <div 
                      key={matchIndex} 
                      className="bg-[#1f1d37] rounded-lg glass border border-white/10 card-hover overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl stagger-item relative group"
                    >
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="flex flex-col md:flex-row items-center justify-between bg-black/20 p-4 border-b border-white/10 relative z-10">
                        <div className="flex items-center gap-3 mb-3 md:mb-0 transform transition-all duration-300 group-hover:translate-x-2">
                          <div className="flex flex-col items-center">
                            <p className="text-xs font-bold text-yellow-400 animate-pulse-scale">{match.date}</p>
                            <p className="text-xs text-white/70">{match.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mb-3 md:mb-0 transform transition-all duration-300 group-hover:scale-105">
                          <p className="text-sm font-bold text-white">{match.team1}</p>
                          <p className="text-sm text-white/70">vs</p>
                          <p className="text-sm font-bold text-white">{match.team2}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push('/sports')}
                            className="bg-green-500 rounded-md px-4 py-2 text-white font-bold text-sm hover:bg-green-600 transition-all duration-300 hover:scale-110 shadow-glow hover:shadow-glow-lg btn-glow relative transform hover:-translate-y-1"
                          >
                            <span className="relative z-10">{t('home.playNowButton')}</span>
                          </button>
                        </div>
                      </div>
  
                      <div className="flex flex-col md:flex-row justify-between items-center p-4 relative z-10">
                        <p className="text-xs text-white/90 mb-3 md:mb-0 font-medium transform transition-all duration-300 group-hover:text-white group-hover:font-semibold">{match.league}</p>
                        <div className="flex gap-2">
                          {Object.entries(match.odds).map(([key, value], idx) => (
                            <button
                              key={idx}
                              onClick={() => router.push('/sports')}
                              className="bg-gray-800 text-white px-6 py-2 rounded-md text-sm hover:bg-gray-700 transition-all duration-300 hover:scale-110 hover-glow transform hover:-translate-y-1 font-semibold"
                            >
                              {key === 'home' ? '1' : key === 'draw' ? 'X' : '2'} <span className="font-bold ml-2 text-yellow-400">{value}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
  
              {/* Game Categories */}
              <div className="px-4 sm:px-6 lg:px-8 py-10 fade-in-on-scroll">
                <h2 className="text-white text-2xl font-bold mb-6 text-gradient transform transition-all duration-300 hover:scale-105">{t('home.gameCategories') || 'Game Categories'}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {gameCategories.map((category, index) => {
                    const getCategoryLink = (title) => {
                      if (title === 'SPOR BAHİSLERİ' || title === t('home.sportsBetting')) return '/sports';
                      if (title === 'SLOT OYUNLARI' || title === t('home.slotGames')) return '/slots';
                      if (title === 'CRASH OYUNLARI' || title === t('home.crashGames')) return '/crash';
                      return '#';
                    };
                    const getCategoryTitle = (title) => {
                      if (title === 'SPOR BAHİSLERİ') return t('home.sportsBetting');
                      if (title === 'SLOT OYUNLARI') return t('home.slotGames');
                      if (title === 'SANAL SPORLAR') return t('home.virtualSports');
                      if (title === 'CRASH OYUNLARI') return t('home.crashGames');
                      return title;
                    };
                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center justify-center p-6 rounded-lg bg-cover bg-center text-center gap-4 card-hover glass stagger-item border border-white/10 hover-brightness relative overflow-hidden transform transition-all duration-500 hover:scale-110 hover:-translate-y-2 group"
                        style={{
                          backgroundImage: `linear-gradient(rgba(21, 19, 40, 0.7), rgba(21, 19, 40, 0.7)), url("${category.image}")`,
                          animationDelay: `${index * 0.1}s`,
                        }}
                      >
                        {/* Animated overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0dccf2]/20 via-transparent to-[#9333ea]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                        
                        <h2 className="text-white text-xl font-bold relative z-10 transform transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-200">{getCategoryTitle(category.title)}</h2>
                        <Link href={getCategoryLink(category.title)} className="bg-white/90 text-black text-sm font-bold px-5 py-2 rounded-md hover:bg-white transition-all duration-300 hover:scale-110 relative z-10 transform hover:-translate-y-1 shadow-lg hover:shadow-xl">
                          {t('home.playNowButton')}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
  
              {/* Trending Section */}
              <div className="py-10 w-full fade-in-on-scroll">
                <h2 className="text-white text-2xl font-bold px-4 sm:px-6 lg:px-8 pb-4 text-gradient transform transition-all duration-300 hover:scale-105">{t('home.trending')}</h2>
                <div className="relative w-full">
                  <div className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-4 w-full">
                    <div className="flex items-stretch px-4 sm:px-6 lg:px-8 gap-3 min-w-max">
                      {trendingGames.map((game, index) => (
                        <div
                          key={index}
                          onClick={() => router.push('/slots')}
                          className="flex flex-col rounded-lg bg-surface-dark shadow-[0_4px_15px_rgba(0,0,0,0.2)] w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-shrink-0 group overflow-hidden cursor-pointer card-hover glass border border-white/10 stagger-item relative transform transition-all duration-500 hover:scale-110 hover:-translate-y-3"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          {/* Animated gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                          
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 z-10"></div>
                          
                          <img 
                            alt={`Game art ${index + 1}`} 
                            className="w-full aspect-[4/3] object-cover hover-brightness transition-all duration-500 group-hover:scale-125" 
                            src={game}
                            loading="lazy"
                          />
                          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 transform translate-y-2 group-hover:translate-y-0">
                            <button className="w-full bg-[#0dccf2] text-white text-xs font-bold py-1.5 rounded hover:bg-[#0bb8d9] transition-all duration-300 hover:scale-110 transform hover:-translate-y-1">
                              {t('home.playNowButton')}
                            </button>
                          </div>
                        </div>
                      ))}
                      {/* End padding spacer */}
                      <div className="flex-shrink-0 w-4 sm:w-6 lg:w-8"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action Section */}
              <div className="px-4 sm:px-6 lg:px-8 py-10 fade-in-on-scroll">
                <div className="bg-gradient-to-r from-[#0dccf2]/20 via-[#9333ea]/20 to-[#0dccf2]/20 rounded-lg p-8 md:p-12 border border-white/10 card-hover glass text-center transform transition-all duration-500 hover:scale-[1.02] relative overflow-hidden group">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0dccf2]/10 via-[#9333ea]/10 to-[#0dccf2]/10 bg-[length:200%_100%] animate-gradient-shift opacity-50"></div>
                  
                  <div className="relative z-10">
                    <h2 className="text-white text-3xl md:text-4xl font-black mb-4 gradient-text transform transition-all duration-300 group-hover:scale-105">
                      Hemen Başlayın ve Kazanmaya Başlayın!
                    </h2>
                    <p className="text-white/70 text-lg mb-6 max-w-2xl mx-auto transform transition-all duration-300 group-hover:text-white">
                      Binlerce oyun, hızlı ödemeler ve güvenli platform ile eğlencenin tadını çıkarın.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => router.push('/deposit')}
                        className="bg-white text-black text-lg font-bold px-8 py-3 rounded-md hover:bg-gray-200 transition-all duration-300 hover:scale-110 shadow-glow transform hover:-translate-y-1"
                      >
                        Hemen Yatır
                      </button>
                      <button
                        onClick={() => router.push('/slots')}
                        className="bg-transparent border-2 border-white text-white text-lg font-bold px-8 py-3 rounded-md hover:bg-white/10 transition-all duration-300 hover:scale-110 transform hover:-translate-y-1"
                      >
                        Oyunları Keşfet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Footer */}
              <Footer />
            </main>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.5;
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animate-gradient-shift {
          animation: gradient-shift 3s ease infinite;
        }
        
        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .animate-pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
